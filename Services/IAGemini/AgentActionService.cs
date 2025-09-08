using System.Security.Claims;
using System.Text;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using FinanceiroApp.Services;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Services
{
    public class AgentActionService : IAgentActionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMovimentacaoBancariaService _movimentacaoService;
        private readonly ILancamentoService _lancamentoService;
        private readonly IPessoaService _pessoaService;

        public AgentActionService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IMovimentacaoBancariaService movimentacaoService,
            ILancamentoService lancamentoService,
            IPessoaService pessoaService
        )
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _movimentacaoService = movimentacaoService;
            _lancamentoService = lancamentoService;
            _pessoaService = pessoaService;
        }

        private int GetUserId()
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var userId))
                throw new UnauthorizedAccessException("Usuário não autenticado ou inválido.");
            return userId;
        }

        public async Task<AgentActionResult> CriarPessoa(
            string nome,
            string? email,
            string? cpf,
            string? cnpj,
            bool confirmado = false
        )
        {
            try
            {
                var userId = GetUserId();
                var tipo = !string.IsNullOrWhiteSpace(cnpj)
                    ? TipoPessoa.Juridica
                    : TipoPessoa.Fisica;

                if (!confirmado)
                {
                    var summary = new StringBuilder();
                    summary.Append(
                        $"Você deseja criar uma nova pessoa com os seguintes dados? Nome: '{nome}'"
                    );
                    if (tipo == TipoPessoa.Juridica)
                        summary.Append($" (Pessoa Jurídica), CNPJ: {cnpj}");
                    else
                        summary.Append($" (Pessoa Física), CPF: {cpf}");
                    if (!string.IsNullOrEmpty(email))
                        summary.Append($", Email: {email}");
                    summary.Append(".");

                    return new AgentActionResult
                    {
                        Success = true,
                        Message = summary.ToString(),
                        RequiresConfirmation = true,
                    };
                }

                var dto = new CriarPessoaDto
                {
                    Nome = nome,
                    Email = email,
                    Cpf = cpf,
                    Cnpj = cnpj,
                    Tipo = tipo,
                    RazaoSocial = tipo == TipoPessoa.Juridica ? nome : null,
                };

                var pessoa = await _pessoaService.CreatePessoaAsync(dto, userId);

                return new AgentActionResult
                {
                    Success = true,
                    Message = $"Pessoa '{nome}' criada com sucesso!",
                    Data = new { id = pessoa.Id },
                };
            }
            catch (Exception ex)
            {
                return new AgentActionResult
                {
                    Success = false,
                    Message = $"Erro ao criar pessoa: {ex.Message}",
                };
            }
        }

        public async Task<AgentActionResult> ExcluirPessoa(
            string nomePessoa,
            bool confirmado = false
        )
        {
            try
            {
                var userId = GetUserId();
                var pessoa = await _context
                    .Pessoas.AsNoTracking()
                    .FirstOrDefaultAsync(p =>
                        p.Nome.ToLower() == nomePessoa.ToLower() && p.UsuarioId == userId
                    );

                if (pessoa == null)
                {
                    return new AgentActionResult
                    {
                        Success = false,
                        Message = $"Pessoa com o nome '{nomePessoa}' não encontrada.",
                    };
                }

                if (!confirmado)
                {
                    return new AgentActionResult
                    {
                        Success = true,
                        Message =
                            $"Tem certeza que deseja excluir a pessoa '{nomePessoa}' Documento '{pessoa.Cnpj ?? pessoa.Cpf}'? Esta ação não pode ser desfeita.",
                        RequiresConfirmation = true,
                    };
                }

                await _pessoaService.DeletePessoaAsync(pessoa.Id, userId);
                return new AgentActionResult
                {
                    Success = true,
                    Message = $"Pessoa '{nomePessoa}' excluída com sucesso.",
                };
            }
            catch (Exception ex)
            {
                return new AgentActionResult
                {
                    Success = false,
                    Message = $"Erro ao excluir pessoa: {ex.Message}",
                };
            }
        }

        public async Task<AgentActionResult> ConsultarSaldoContaBancaria(string nomeContaBancaria)
        {
            var userId = GetUserId();
            var conta = await _context
                .ContasBancarias.AsNoTracking()
                .FirstOrDefaultAsync(cb =>
                    cb.Descricao.ToLower() == nomeContaBancaria.ToLower() && cb.UsuarioId == userId
                );

            if (conta == null)
            {
                return new AgentActionResult
                {
                    Success = false,
                    Message = $"Conta bancária com o nome '{nomeContaBancaria}' não encontrada.",
                };
            }

            return new AgentActionResult
            {
                Success = true,
                Message = $"O saldo da conta '{conta.Descricao}' é de {conta.Saldo:C2}.",
                Data = new { saldo = conta.Saldo },
            };
        }

        public async Task<AgentActionResult> CriarLancamentoDespesa(
            string descricao,
            decimal valor,
            DateTime dataVencimento,
            string nomePessoa,
            string nomePlanoContas,
            DateTime? dataPagamento,
            string? nomeContaBancaria
        )
        {
            try
            {
                var userId = GetUserId();

                var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
                    p.Nome.ToLower() == nomePessoa.ToLower() && p.UsuarioId == userId
                );
                if (pessoa == null)
                    return new AgentActionResult
                    {
                        Success = false,
                        Message =
                            $"Não encontrei uma pessoa com o nome '{nomePessoa}'. Você pode cadastrá-la primeiro.",
                    };

                var planoContas = await _context.PlanosContas.FirstOrDefaultAsync(pc =>
                    pc.Descricao.ToLower() == nomePlanoContas.ToLower() && pc.UsuarioId == userId
                );
                if (planoContas == null)
                    return new AgentActionResult
                    {
                        Success = false,
                        Message =
                            $"Não encontrei um plano de contas com o nome '{nomePlanoContas}'.",
                    };

                ContaBancaria? contaBancaria = null;
                if (!string.IsNullOrWhiteSpace(nomeContaBancaria))
                {
                    contaBancaria = await _context.ContasBancarias.FirstOrDefaultAsync(cb =>
                        cb.Descricao.ToLower() == nomeContaBancaria.ToLower()
                        && cb.UsuarioId == userId
                    );
                    if (contaBancaria == null)
                        return new AgentActionResult
                        {
                            Success = false,
                            Message =
                                $"Não encontrei uma conta bancária com o nome '{nomeContaBancaria}'.",
                        };
                }

                var dto = new CriarLancamentoDto
                {
                    Descricao = descricao,
                    Valor = valor,
                    DataVencimento = dataVencimento,
                    DataCompetencia = dataVencimento,
                    PessoaId = pessoa.Id,
                    PlanoContasId = planoContas.Id,
                    Tipo = "D",
                    Pago = dataPagamento.HasValue,
                    DataPagamento = dataPagamento,
                    ContaBancariaId = contaBancaria?.Id,
                };

                var lancamento = await _lancamentoService.CreateLancamentoAsync(dto, userId);

                return new AgentActionResult
                {
                    Success = true,
                    Message = "Lançamento de despesa criado com sucesso!",
                    Data = new { id = lancamento.Id },
                };
            }
            catch (InvalidOperationException ex)
            {
                return new AgentActionResult { Success = false, Message = ex.Message };
            }
            catch (Exception ex)
            {
                return new AgentActionResult
                {
                    Success = false,
                    Message = $"Ocorreu um erro inesperado ao criar o lançamento: {ex.Message}",
                };
            }
        }
    }
}
