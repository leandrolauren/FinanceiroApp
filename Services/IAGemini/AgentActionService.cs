using System.Security.Claims;
using System.Text;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
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
        private readonly IRabbitMqService _rabbitMqService;
        private readonly IRelatorioAppService _relatorioAppService;

        public AgentActionService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IMovimentacaoBancariaService movimentacaoService,
            ILancamentoService lancamentoService,
            IPessoaService pessoaService,
            IRabbitMqService rabbitMqService,
            IRelatorioAppService relatorioAppService
        )
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _movimentacaoService = movimentacaoService;
            _lancamentoService = lancamentoService;
            _pessoaService = pessoaService;
            _rabbitMqService = rabbitMqService;
            _relatorioAppService = relatorioAppService;
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
                var contasDisponiveis = await _context
                    .ContasBancarias.AsNoTracking()
                    .Where(c => c.UsuarioId == userId && c.Ativa)
                    .Select(c => c.Descricao)
                    .ToListAsync();

                var mensagemErro =
                    $"Conta bancária com o nome '{nomeContaBancaria}' não encontrada.";
                if (contasDisponiveis.Any())
                {
                    mensagemErro +=
                        $" As contas disponíveis são: {string.Join(", ", contasDisponiveis)}.";
                }

                return new AgentActionResult { Success = false, Message = mensagemErro };
            }

            return new AgentActionResult
            {
                Success = true,
                Message = $"O saldo da conta '{conta.Descricao}' é de {conta.Saldo:C2}.",
                Data = new { saldo = conta.Saldo },
            };
        }

        public async Task<AgentActionResult> CriarLancamento(
            string descricao,
            decimal valor,
            string tipo,
            DateTime dataVencimento,
            string nomePessoa,
            string nomePlanoContas,
            DateTime? dataPagamento,
            string? nomeContaBancaria,
            bool confirmado = false
        )
        {
            try
            {
                var userId = GetUserId();
                string tipoLancamentoUpper = tipo.ToUpper();
                if (tipoLancamentoUpper != "R" && tipoLancamentoUpper != "D")
                {
                    return new AgentActionResult
                    {
                        Success = false,
                        Message =
                            "O tipo de lançamento deve ser 'R' para Receita ou 'D' para Despesa.",
                    };
                }
                string tipoLancamentoDesc = tipoLancamentoUpper == "R" ? "receita" : "despesa";
                var tipoMovimento =
                    tipoLancamentoUpper == "R" ? TipoLancamento.Receita : TipoLancamento.Despesa;

                if (!confirmado)
                {
                    var summary = new StringBuilder();
                    summary.Append(
                        $"Você deseja criar um novo lançamento de {tipoLancamentoDesc} com os seguintes dados? Descrição: '{descricao}', Valor: {valor:C2}, Vencimento: {dataVencimento:dd/MM/yyyy}"
                    );
                    summary.Append($", Pessoa: '{nomePessoa}', Categoria: '{nomePlanoContas}'");

                    if (dataPagamento.HasValue)
                    {
                        summary.Append($", Pago em: {dataPagamento.Value:dd/MM/yyyy}");
                        if (!string.IsNullOrWhiteSpace(nomeContaBancaria))
                        {
                            summary.Append($" pela conta '{nomeContaBancaria}'");
                        }
                    }
                    summary.Append(".");

                    return new AgentActionResult
                    {
                        Success = true,
                        Message = summary.ToString(),
                        RequiresConfirmation = true,
                    };
                }

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
                    pc.Descricao.ToLower() == nomePlanoContas.ToLower()
                    && pc.UsuarioId == userId
                    && (int)pc.Tipo == (int)tipoMovimento
                );
                if (planoContas == null)
                    return new AgentActionResult
                    {
                        Success = false,
                        Message =
                            $"Não encontrei um plano de contas de {tipoLancamentoDesc} com o nome '{nomePlanoContas}'.",
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
                    Tipo = tipoLancamentoUpper,
                    Pago = dataPagamento.HasValue,
                    DataPagamento = dataPagamento,
                    ContaBancariaId = contaBancaria?.Id,
                };

                var lancamento = await _lancamentoService.CreateLancamentoAsync(dto, userId);

                return new AgentActionResult
                {
                    Success = true,
                    Message =
                        $"Lançamento de {tipoLancamentoDesc} '{descricao}' criado com sucesso!",
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

        public async Task<AgentActionResult> ObterResumoFinanceiro(
            DateTime dataInicio,
            DateTime dataFim,
            string? status
        )
        {
            try
            {
                var userId = GetUserId();
                var requestDto = new GerarRelatorioRequestDto
                {
                    DataInicio = dataInicio,
                    DataFim = dataFim,
                    Status = status ?? "Todos",
                };

                var relatorio = await _relatorioAppService.SolicitarResumoFinanceiroAsync(
                    requestDto,
                    userId
                );

                return new AgentActionResult
                {
                    Success = true,
                    Message =
                        $"Cocoricó! Sua solicitação de relatório foi registrada com sucesso. Ele está sendo processado e será enviado para o seu e-mail em breve.",
                    Data = new { relatorioId = relatorio.Id },
                };
            }
            catch (Exception ex)
            {
                return new AgentActionResult
                {
                    Success = false,
                    Message = $"Ocorreu um erro ao solicitar seu resumo financeiro: {ex.Message}",
                };
            }
        }
    }
}
