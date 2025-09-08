using System.Data;
using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Helpers;
using FinanceiroApp.Models;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Authorize]
public class LancamentosController : Controller
{
    public IActionResult Index() => View();

    public IActionResult Create() => View();

    public IActionResult Edit(int id)
    {
        ViewBag.Id = id;
        return View();
    }
}

[Authorize]
[ApiController]
[Route("api/")]
public class LancamentosApiController(
    ApplicationDbContext context,
    IMovimentacaoBancariaService movimentacaoService,
    ILancamentoService lancamentoService
) : ControllerBase
{
    [HttpGet("lancamentos")]
    public async Task<IActionResult> GetLancamentos([FromQuery] LancamentoQueryParams queryParams)
    {
        try
        {
            var userId = ObterUsuarioId();
            var query = context
                .Lancamentos.Include(l => l.ContaBancaria)
                .Include(l => l.PlanoContas)
                .Include(l => l.Pessoa)
                .Where(l => l.UsuarioId == userId)
                .AsNoTracking()
                .AsQueryable();

            if (queryParams.Tipo == "R")
                query = query.Where(l => l.Tipo == TipoLancamento.Receita);
            else if (queryParams.Tipo == "D")
                query = query.Where(l => l.Tipo == TipoLancamento.Despesa);

            if (queryParams.Pago.HasValue)
                query = query.Where(l => l.Pago == queryParams.Pago.Value);

            if (queryParams.PessoaId.HasValue)
                query = query.Where(l => l.PessoaId == queryParams.PessoaId.Value);

            if (queryParams.PlanoContasId.HasValue)
                query = query.Where(l => l.PlanoContaId == queryParams.PlanoContasId.Value);

            if (queryParams.ContaBancariaId.HasValue)
                query = query.Where(l => l.ContaBancariaId == queryParams.ContaBancariaId.Value);

            if (queryParams.DataInicio.HasValue && queryParams.DataFim.HasValue)
            {
                var dataInicio = DateTime
                    .SpecifyKind(queryParams.DataInicio.Value, DateTimeKind.Unspecified)
                    .Date;
                var dataFim = DateTime
                    .SpecifyKind(queryParams.DataFim.Value, DateTimeKind.Unspecified)
                    .Date.AddDays(1)
                    .AddTicks(-1);

                query = queryParams.TipoData?.ToLower() switch
                {
                    "pagamento" => query.Where(l =>
                        l.DataPagamento.HasValue
                        && l.DataPagamento.Value >= dataInicio
                        && l.DataPagamento.Value <= dataFim
                    ),
                    "competencia" => query.Where(l =>
                        l.DataCompetencia >= dataInicio && l.DataCompetencia <= dataFim
                    ),
                    "lancamento" => query.Where(l =>
                        l.DataLancamento >= dataInicio && l.DataLancamento <= dataFim
                    ),
                    _ => query.Where(l =>
                        l.DataVencimento >= dataInicio && l.DataVencimento <= dataFim
                    ),
                };
            }

            // Ordenação
            if (!string.IsNullOrEmpty(queryParams.SortColumn))
            {
                var isDescending = queryParams.SortDirection?.ToLower() == "descending";
                query = (queryParams.SortColumn.ToLower(), isDescending) switch
                {
                    ("descricao", false) => query.OrderBy(l => l.Descricao),
                    ("descricao", true) => query.OrderByDescending(l => l.Descricao),
                    ("valor", false) => query.OrderBy(l => l.Valor),
                    ("valor", true) => query.OrderByDescending(l => l.Valor),
                    ("pessoanome", false) => query.OrderBy(l => l.Pessoa.Nome),
                    ("pessoanome", true) => query.OrderByDescending(l => l.Pessoa.Nome),
                    ("datavencimento", false) => query.OrderBy(l => l.DataVencimento),
                    ("datavencimento", true) => query.OrderByDescending(l => l.DataVencimento),
                    ("datacompentencia", false) => query.OrderBy(l => l.DataCompetencia),
                    ("datacompentencia", true) => query.OrderByDescending(l => l.DataCompetencia),
                    ("datapagamento", false) => query.OrderBy(l => l.DataPagamento),
                    ("datapagamento", true) => query.OrderByDescending(l => l.DataPagamento),
                    _ => query.OrderByDescending(l => l.DataVencimento),
                };
            }
            else
            {
                query = query.OrderByDescending(l => l.DataVencimento);
            }

            var pagedLancamentos = await PagedList<LancamentoModel>.CreateAsync(
                query,
                queryParams.PageNumber,
                queryParams.PageSize
            );

            Response.AddPaginationHeader(pagedLancamentos.GetPaginationHeader());

            var lancamentosDto = pagedLancamentos
                .Select(l => new DetalhesLancamentoDto
                {
                    Id = l.Id,
                    Descricao = l.Descricao,
                    Tipo = l.Tipo.ToString(),
                    Valor = l.Valor,
                    DataCompetencia = l.DataCompetencia,
                    DataVencimento = l.DataVencimento,
                    DataPagamento = l.DataPagamento,
                    DataLancamento = l.DataLancamento,
                    Pago = l.Pago,
                    Pessoa =
                        l.Pessoa != null
                            ? new PessoaSimplificadaDto { Id = l.Pessoa.Id, Nome = l.Pessoa.Nome }
                            : null,
                    PlanoContas =
                        l.PlanoContas != null
                            ? new PlanoContasSimplificadoDto
                            {
                                Id = l.PlanoContas.Id,
                                Descricao = l.PlanoContas.Descricao,
                            }
                            : null,
                    ContaBancaria =
                        l.ContaBancaria != null
                            ? new ContaBancariaSimplificadaDto
                            {
                                Id = l.ContaBancaria.Id,
                                Nome = l.ContaBancaria.Descricao,
                            }
                            : null,
                })
                .ToList();

            return Ok(
                new ResponseModel<List<DetalhesLancamentoDto>>
                {
                    Data = lancamentosDto,
                    Message = "Lançamentos listados com sucesso.",
                }
            );
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new ResponseModel<List<DetalhesLancamentoDto>>
                {
                    Message = "Erro ao listar lançamentos.",
                    Success = false,
                    Errors = { ex.Message },
                }
            );
        }
    }

    [HttpGet("lancamentos/{id}")]
    public async Task<ResponseModel<DetalhesLancamentoDto>> GetLancamento(int id)
    {
        ResponseModel<DetalhesLancamentoDto> resposta = new();
        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await context
                .Lancamentos.Include(l => l.ContaBancaria)
                .Include(l => l.PlanoContas)
                .Include(l => l.Pessoa)
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);

            if (lancamento == null)
            {
                resposta.Message = "Lançamento não encontrado.";
                resposta.Success = false;
                resposta.StatusCode = 404;
                return resposta;
            }

            resposta.Data = new DetalhesLancamentoDto
            {
                Id = lancamento.Id,
                Descricao = lancamento.Descricao,
                Tipo = lancamento.Tipo.ToString(),
                Valor = lancamento.Valor,
                DataCompetencia = lancamento.DataCompetencia,
                DataVencimento = lancamento.DataVencimento,
                DataPagamento = lancamento.DataPagamento,
                DataLancamento = lancamento.DataLancamento,
                Pago = lancamento.Pago,
                Pessoa =
                    lancamento.Pessoa != null
                        ? new PessoaSimplificadaDto
                        {
                            Id = lancamento.Pessoa.Id,
                            Nome = lancamento.Pessoa.Nome,
                        }
                        : null,
                PlanoContas =
                    lancamento.PlanoContas != null
                        ? new PlanoContasSimplificadoDto
                        {
                            Id = lancamento.PlanoContas.Id,
                            Descricao = lancamento.PlanoContas.Descricao,
                        }
                        : null,
                ContaBancaria =
                    lancamento.ContaBancaria != null
                        ? new ContaBancariaSimplificadaDto
                        {
                            Id = lancamento.ContaBancaria.Id,
                            Nome = lancamento.ContaBancaria.Descricao,
                        }
                        : null,
            };
        }
        catch (Exception ex)
        {
            resposta.Message = "Erro ao obter lançamento.";
            resposta.Success = false;
            resposta.StatusCode = 500;
            resposta.Errors.Add(ex.Message);
        }
        return resposta;
    }

    [HttpPost("lancamentos")]
    public async Task<IActionResult> Create([FromBody] CriarLancamentoDto dto)
    {
        ResponseModel<string> resposta = new();
        if (!ModelState.IsValid)
        {
            resposta.Success = false;
            resposta.Message = "Dados inválidos.";
            resposta.Errors = ModelState
                .Values.SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(resposta);
        }

        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await lancamentoService.CreateLancamentoAsync(dto, userId);

            resposta.Data = lancamento.Id.ToString();
            resposta.Message = "Lançamento cadastrado com sucesso.";
            return Ok(resposta);
        }
        catch (InvalidOperationException ex)
        {
            resposta.Success = false;
            resposta.Message = ex.Message;
            resposta.Errors.Add(ex.Message);
            return BadRequest(resposta);
        }
        catch (Exception ex)
        {
            resposta.Message = "Erro ao criar Lançamento";
            resposta.Success = false;
            resposta.Errors.Add(ex.Message);
            return StatusCode(500, resposta);
        }
    }

    [HttpPut("lancamentos/{id}")]
    public async Task<IActionResult> Edit(int id, [FromBody] LancamentoEditDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.Pago && (!dto.ContaBancariaId.HasValue || dto.ContaBancariaId.Value <= 0))
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Para marcar um lançamento como 'Pago', é obrigatório selecionar uma Conta Bancária.",
                }
            );
        }

        if (dto.Pago && !dto.DataPagamento.HasValue)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Para marcar um lançamento como 'Pago', a Data de Pagamento é obrigatória.",
                }
            );
        }

        var userId = ObterUsuarioId();
        var lancamentoOriginal = await context
            .Lancamentos.AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);

        if (lancamentoOriginal == null)
            return NotFound(new { success = false, message = "Lançamento não encontrado." });

        if (lancamentoOriginal.Pago)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Lançamentos pagos não podem ser editados. Para alterar, primeiro realize o estorno.",
                }
            );
        }

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var lancamentoParaAtualizar = await context.Lancamentos.FirstOrDefaultAsync(l =>
                l.Id == id
            );

            lancamentoParaAtualizar.Descricao = dto.Descricao;
            lancamentoParaAtualizar.Valor = dto.Valor;
            lancamentoParaAtualizar.DataCompetencia = dto.DataCompetencia;
            lancamentoParaAtualizar.DataVencimento = dto.DataVencimento;
            lancamentoParaAtualizar.DataPagamento = dto.DataPagamento;
            lancamentoParaAtualizar.Pago = dto.Pago;
            lancamentoParaAtualizar.ContaBancariaId = dto.ContaBancariaId;
            lancamentoParaAtualizar.PlanoContaId = dto.PlanoContasId;
            lancamentoParaAtualizar.PessoaId = dto.PessoaId;

            if (
                !lancamentoOriginal.Pago
                && lancamentoParaAtualizar.Pago
                && lancamentoParaAtualizar.ContaBancariaId.HasValue
            )
                await movimentacaoService.RegistrarMovimentacaoDePagamento(lancamentoParaAtualizar);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Lançamento atualizado com sucesso!" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(
                500,
                new
                {
                    success = false,
                    message = "Erro ao atualizar lançamento.",
                    error = ex.Message,
                }
            );
        }
    }

    [HttpPost("lancamentos/{id}/estornar")]
    public async Task<IActionResult> EstornarPagamento(int id)
    {
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await context.Lancamentos.FirstOrDefaultAsync(l =>
                l.Id == id && l.UsuarioId == userId
            );

            if (lancamento == null)
                return NotFound(new { success = false, message = "Lançamento não encontrado." });

            if (!lancamento.Pago)
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Este lançamento não está pago para ser estornado.",
                    }
                );

            await movimentacaoService.RegistrarMovimentacaoDeEstorno(lancamento);

            lancamento.Pago = false;
            lancamento.DataPagamento = null;
            context.Lancamentos.Update(lancamento);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Pagamento estornado com sucesso." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(
                500,
                new
                {
                    success = false,
                    message = "Erro ao estornar pagamento.",
                    error = ex.Message,
                }
            );
        }
    }

    [HttpDelete("lancamentos/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = ObterUsuarioId();
        var lancamento = await context
            .Lancamentos.Include(l => l.Parcelas)
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);

        if (lancamento == null)
            return NotFound(new { success = false, message = "Lançamento não encontrado." });

        if (lancamento.Pago)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Lançamentos pagos não podem ser excluídos. Para remover, primeiro realize o estorno.",
                }
            );
        }

        if (lancamento.Parcelas?.Any() == true)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Este lançamento possui parcelas e não pode ser excluído.",
                }
            );
        }

        context.Lancamentos.Remove(lancamento);
        await context.SaveChangesAsync();

        return Ok(new { success = true, message = "Lançamento removido." });
    }

    private int ObterUsuarioId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Usuário não autenticado.");

        return int.Parse(claim.Value);
    }
}
