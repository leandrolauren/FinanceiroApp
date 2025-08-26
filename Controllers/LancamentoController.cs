using System.Data;
using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
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
public class LancamentosApiController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet("lancamentos")]
    public async Task<ResponseModel<List<ListaLancamentoDto>>> GetLancamentos()
    {
        ResponseModel<List<ListaLancamentoDto>> resposta = new();
        try
        {
            var userId = ObterUsuarioId();
            var lancamentos = await context
                .Lancamentos.Include(l => l.ContaBancaria)
                .Include(l => l.PlanoContas)
                .Include(l => l.Pessoa)
                .Where(l => l.UsuarioId == userId)
                .OrderByDescending(l => l.DataLancamento)
                .Select(l => new ListaLancamentoDto
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
                    PessoaNome = l.Pessoa == null ? "" : l.Pessoa.Nome,
                    PlanoContasDescricao = l.PlanoContas == null ? "" : l.PlanoContas.Descricao,
                    ContaBancariaDescricao =
                        l.ContaBancaria == null ? "" : l.ContaBancaria.Descricao,
                })
                .ToListAsync();

            resposta.Data = lancamentos;
            resposta.Message = "Lançamentos listados com sucesso.";
        }
        catch (Exception ex)
        {
            resposta.Message = "Erro ao listar lançamentos.";
            resposta.Success = false;
            resposta.StatusCode = 500;
            resposta.Errors.Add(ex.Message);
        }

        return resposta;
    }

    [HttpGet("lancamentos/{id}")]
    public async Task<ResponseModel<ListaLancamentoDto>> GetLancamento(int id)
    {
        ResponseModel<ListaLancamentoDto> resposta = new();
        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await context
                .Lancamentos.Include(l => l.ContaBancaria)
                .Include(l => l.PlanoContas)
                .Include(l => l.Pessoa)
                .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);

            if (lancamento == null)
            {
                resposta.Message = "Lançamento não encontrado.";
                resposta.Success = false;
                resposta.StatusCode = 404;
                return resposta;
            }

            resposta.Data = new ListaLancamentoDto
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
                PessoaNome = lancamento.Pessoa == null ? "" : lancamento.Pessoa.Nome,
                PlanoContasDescricao =
                    lancamento.PlanoContas == null ? "" : lancamento.PlanoContas.Descricao,
                ContaBancariaDescricao =
                    lancamento.ContaBancaria == null ? "" : lancamento.ContaBancaria.Descricao,
            };
        }
        catch (Exception ex)
        {
            resposta.Message = "Erro ao obter lançamento.";
            resposta.Success = false;
            resposta.StatusCode = 500;
            resposta.Errors.AddRange(ex.Message);
        }
        return resposta;
    }

    [HttpPost("lancamentos")]
    public async Task<ResponseModel<string>> Create([FromBody] LancamentoCreateDto dto)
    {
        ResponseModel<string> resposta = new();
        if (!ModelState.IsValid)
        {
            resposta.Success = false;
            resposta.Message = "Dados inválidos.";
            resposta.StatusCode = 400;
            resposta.Errors.AddRange("Dados inválidos.");
            return resposta;
        }

        try
        {
            var userId = ObterUsuarioId();
            var lancamento = new LancamentoModel
            {
                Descricao = dto.Descricao,
                Tipo = Enum.Parse<TipoLancamento>(dto.Tipo, true),
                Valor = dto.Valor,
                DataCompetencia = dto.DataCompetencia,
                DataVencimento = dto.DataVencimento,
                DataPagamento = dto.DataPagamento,
                Pago = dto.Pago,
                ContaBancariaId = dto.ContaBancariaId,
                PlanoContaId = dto.PlanoContasId,
                PessoaId = dto.PessoaId,
                UsuarioId = userId,
            };

            context.Lancamentos.Add(lancamento);
            await context.SaveChangesAsync();

            resposta.Data = lancamento.Id.ToString();
            resposta.Message = "Conta cadastrada com sucesso.";
        }
        catch (Exception ex)
        {
            resposta.Message = "Erro ao criar Lançamento";
            resposta.Success = false;
            resposta.StatusCode = 500;
            resposta.Errors.Add(ex.Message);
        }
        return resposta;
    }

    [HttpPut("lancamentos/{id}")]
    public async Task<IActionResult> Edit(int id, [FromBody] LancamentoEditDto dto)
    {
        if (id != dto.Id)
            return BadRequest(new { success = false, message = "ID do lançamento inválido." });

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await context.Lancamentos.FirstOrDefaultAsync(l =>
                l.Id == id && l.UsuarioId == userId
            );

            if (lancamento == null)
                return NotFound(new { success = false, message = "Lançamento não encontrado." });

            lancamento.Descricao = dto.Descricao;
            lancamento.Valor = dto.Valor;
            lancamento.DataCompetencia = dto.DataCompetencia;
            lancamento.DataVencimento = dto.DataVencimento;
            lancamento.DataPagamento = dto.DataPagamento;
            lancamento.Pago = dto.Pago;
            lancamento.ContaBancariaId = dto.ContaBancariaId;
            lancamento.PlanoContaId = dto.PlanoContasId;
            lancamento.PessoaId = dto.PessoaId;

            context.Lancamentos.Update(lancamento);
            await context.SaveChangesAsync();

            return Ok(new { success = true, message = "Lançamento atualizado com sucesso!" });
        }
        catch (Exception ex)
        {
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

    [HttpDelete("lancamentos/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var lancamento = await ObterLancamento(id);
        if (lancamento == null)
            return NotFound(new { success = false, message = "Lançamento não encontrado." });

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

    // Helpers
    private int ObterUsuarioId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Usuário não autenticado.");

        return int.Parse(claim.Value);
    }

    private async Task<LancamentoModel?> ObterLancamento(int id)
    {
        var userId = ObterUsuarioId();
        return await context
            .Lancamentos.Include(l => l.Parcelas)
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);
    }
}
