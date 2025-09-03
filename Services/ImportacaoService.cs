using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Services
{
    public class ImportacaoService : IImportacaoService
    {
        private readonly ApplicationDbContext _context;
        private readonly IServiceProvider _serviceProvider;

        private readonly IMovimentacaoBancariaService _movimentacaoBancariaService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ImportacaoService(
            ApplicationDbContext context,
            IServiceProvider serviceProvider,
            IHttpContextAccessor httpContextAccessor,
            IMovimentacaoBancariaService movimentacaoBancariaService
        )
        {
            _context = context;
            _serviceProvider = serviceProvider;
            _httpContextAccessor = httpContextAccessor;
            _movimentacaoBancariaService = movimentacaoBancariaService;
        }

        private int GetUserId()
        {
            var userClaim = _httpContextAccessor.HttpContext?.User.FindFirst(
                ClaimTypes.NameIdentifier
            );
            if (userClaim != null && int.TryParse(userClaim.Value, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Usuário não pode ser identificado.");
        }

        public async Task<IEnumerable<OfxTransactionDto>> ParseFile(
            IFormFile file,
            string fileType,
            int contaBancariaId,
            DateTime dataInicio,
            DateTime dataFim
        )
        {
            var userId = GetUserId();
            var parser = GetParser(fileType);
            var allTransactions = await parser.Parse(file);

            var filteredTransactions = allTransactions
                .Where(t => t.Date.Date >= dataInicio.Date && t.Date.Date <= dataFim.Date)
                .ToList();

            var fitIdsInPeriod = filteredTransactions
                .Select(t => t.FitId)
                .Where(id => !string.IsNullOrEmpty(id))
                .ToList();
            var existingFitIds = await _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && l.OfxFitId != null
                    && fitIdsInPeriod.Contains(l.OfxFitId)
                )
                .Select(l => l.OfxFitId!)
                .ToHashSetAsync();

            foreach (var trx in filteredTransactions)
            {
                trx.IsImported = existingFitIds.Contains(trx.FitId);
            }

            return filteredTransactions.OrderByDescending(t => t.Date);
        }

        public async Task<int> ImportTransactions(ImportOfxRequestDto request, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transactionsToImport = request
                    .Transactions.Where(t => !t.IsImported && !string.IsNullOrEmpty(t.FitId))
                    .ToList();

                if (transactionsToImport.Count == 0)
                    return 0;

                bool hasReceitas = transactionsToImport.Any(t => t.Amount >= 0);
                bool hasDespesas = transactionsToImport.Any(t => t.Amount < 0);

                if (hasReceitas && !request.PlanoContasReceitaId.HasValue)
                    throw new InvalidOperationException(
                        "Um Plano de Contas para Receita é obrigatório pois há receitas selecionadas."
                    );

                if (hasDespesas && !request.PlanoContasDespesaId.HasValue)
                    throw new InvalidOperationException(
                        "Um Plano de Contas para Despesa é obrigatório pois há despesas selecionadas."
                    );

                var fitIdsToImport = transactionsToImport.Select(t => t.FitId).ToList();
                var existingFitIds = await _context
                    .Lancamentos.AsNoTracking()
                    .Where(l => l.UsuarioId == userId && fitIdsToImport.Contains(l.OfxFitId))
                    .Select(l => l.OfxFitId!)
                    .ToHashSetAsync();

                var newLaunchesCount = 0;
                foreach (var trx in transactionsToImport)
                {
                    if (existingFitIds.Contains(trx.FitId))
                        continue;

                    int planoContasId;
                    TipoLancamento tipoLancamento;

                    if (trx.Amount >= 0)
                    {
                        planoContasId = request.PlanoContasReceitaId!.Value;
                        tipoLancamento = TipoLancamento.Receita;
                    }
                    else
                    {
                        planoContasId = request.PlanoContasDespesaId!.Value;
                        tipoLancamento = TipoLancamento.Despesa;
                    }

                    var launch = new LancamentoModel
                    {
                        UsuarioId = userId,
                        ContaBancariaId = request.ContaBancariaId,
                        PlanoContaId = planoContasId,
                        PessoaId = request.PessoaId,
                        Descricao = trx.Description,
                        Valor = Math.Abs(trx.Amount),
                        Tipo = tipoLancamento,
                        DataCompetencia = request.DataCompetencia.Date,
                        DataVencimento = request.DataVencimento.Date,
                        DataPagamento = trx.Date.Date,
                        Pago = true,
                        OfxFitId = trx.FitId,
                        DataLancamento = DateTime.Now,
                    };

                    await _context.Lancamentos.AddAsync(launch);
                    await _movimentacaoBancariaService.RegistrarMovimentacaoDePagamento(launch);

                    newLaunchesCount++;
                }

                if (newLaunchesCount == 0)
                {
                    await transaction.RollbackAsync();
                    return 0;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return newLaunchesCount;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private IFileParser GetParser(string fileType)
        {
            return fileType.ToLowerInvariant() switch
            {
                "ofx" => new OfxParser(),
                _ => throw new NotSupportedException(
                    $"Tipo de arquivo '{fileType}' não é suportado."
                ),
            };
        }
    }
}
