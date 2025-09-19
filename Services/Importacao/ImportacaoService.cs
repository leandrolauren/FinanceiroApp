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

                bool needsBulkReceita = transactionsToImport.Any(t =>
                    t.Amount >= 0 && !t.PlanoContasId.HasValue
                );
                if (needsBulkReceita && !request.PlanoContasReceitaId.HasValue)
                {
                    throw new InvalidOperationException(
                        "Um Plano de Contas para Receita é obrigatório pois há receitas selecionadas sem categoria individual."
                    );
                }

                bool needsBulkDespesa = transactionsToImport.Any(t =>
                    t.Amount < 0 && !t.PlanoContasId.HasValue
                );
                if (needsBulkDespesa && !request.PlanoContasDespesaId.HasValue)
                    throw new InvalidOperationException(
                        "Um Plano de Contas para Despesa é obrigatório pois há despesas selecionadas sem categoria individual."
                    );

                var fitIdsToImport = transactionsToImport.Select(t => t.FitId).ToList();
                var existingFitIds = await _context
                    .Lancamentos.AsNoTracking()
                    .Where(l => l.UsuarioId == userId && fitIdsToImport.Contains(l.OfxFitId))
                    .Select(l => l.OfxFitId!)
                    .ToHashSetAsync();

                var contaBancaria =
                    await _context.ContasBancarias.FindAsync(request.ContaBancariaId)
                    ?? throw new KeyNotFoundException("Conta bancária não encontrada.");

                var novosLancamentos = new List<LancamentoModel>();
                var novasMovimentacoes = new List<MovimentacaoBancaria>();

                foreach (var trx in transactionsToImport)
                {
                    if (existingFitIds.Contains(trx.FitId))
                        continue;

                    int? planoContasId = trx.PlanoContasId;
                    if (!planoContasId.HasValue)
                    {
                        planoContasId =
                            trx.Amount >= 0
                                ? request.PlanoContasReceitaId
                                : request.PlanoContasDespesaId;
                    }

                    if (!planoContasId.HasValue)
                        throw new InvalidOperationException(
                            $"A transação '{trx.Description}' não possui um plano de contas associado."
                        );

                    TipoLancamento tipoLancamento =
                        trx.Amount >= 0 ? TipoLancamento.Receita : TipoLancamento.Despesa;

                    var launch = new LancamentoModel
                    {
                        UsuarioId = userId,
                        ContaBancariaId = request.ContaBancariaId,
                        PlanoContaId = planoContasId.Value,
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

                    novosLancamentos.Add(launch);

                    var movimentacao = new MovimentacaoBancaria
                    {
                        DataMovimentacao = launch.DataPagamento!.Value,
                        Valor = launch.Valor,
                        Historico = $"PGTO: {launch.Descricao}",
                        ContaBancariaId = launch.ContaBancariaId!.Value,
                        UsuarioId = userId,
                        Lancamento = launch,
                        TipoMovimentacao =
                            launch.Tipo == TipoLancamento.Receita
                                ? TipoMovimentacao.Entrada
                                : TipoMovimentacao.Saida,
                    };
                    novasMovimentacoes.Add(movimentacao);
                }

                if (novosLancamentos.Count == 0)
                {
                    await transaction.RollbackAsync();
                    return 0;
                }

                var saldoChange = novasMovimentacoes.Sum(m =>
                    m.TipoMovimentacao == TipoMovimentacao.Entrada ? m.Valor : -m.Valor
                );
                contaBancaria.Saldo += saldoChange;
                _context.ContasBancarias.Update(contaBancaria);

                await _context.Lancamentos.AddRangeAsync(novosLancamentos);
                await _context.MovimentacoesBancarias.AddRangeAsync(novasMovimentacoes);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return novosLancamentos.Count;
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
