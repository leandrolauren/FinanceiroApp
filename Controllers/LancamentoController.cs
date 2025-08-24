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
[ApiController]
[Route("api/[controller]")]
public class LancamentosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LancamentosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLancamentos()
    {
        var userId = ObterUsuarioId();
        var lancamentos = await _context
            .Lancamentos.Include(l => l.ContaBancaria)
            .Include(l => l.PlanoContas)
            .Include(l => l.Pessoa)
            .Where(l => l.UsuarioId == userId)
            .OrderByDescending(l => l.DataLancamento)
            .Select(l => new LancamentoDto
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
                    l.Pessoa == null
                        ? null
                        : new PessoaLancamentoDto { Id = l.Pessoa.Id, Nome = l.Pessoa.Nome },
                PlanoContas =
                    l.PlanoContas == null
                        ? null
                        : new PlanoContasLancamentoDto
                        {
                            Id = l.PlanoContas.Id,
                            Descricao = l.PlanoContas.Descricao,
                        },
                ContaBancaria =
                    l.ContaBancaria == null
                        ? null
                        : new ContaDto
                        {
                            Id = l.ContaBancaria.Id,
                            Descricao = l.ContaBancaria.Descricao,
                            Agencia = l.ContaBancaria.Agencia,
                            Banco = l.ContaBancaria.Banco,
                            Ativa = l.ContaBancaria.Ativa,
                            NumeroConta = l.ContaBancaria.NumeroConta,
                            DigitoConta = l.ContaBancaria.DigitoConta,
                            DigitoAgencia = l.ContaBancaria.DigitoAgencia,
                            Saldo = l.ContaBancaria.Saldo,
                            Tipo = l.ContaBancaria.Tipo.ToString(),
                            UsuarioId = l.ContaBancaria.UsuarioId,
                        },
            })
            .ToListAsync();

        return Ok(lancamentos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLancamento(int id)
    {
        var userId = ObterUsuarioId();
        var lancamento = await _context
            .Lancamentos.Include(l => l.ContaBancaria)
            .Include(l => l.PlanoContas)
            .Include(l => l.Pessoa)
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);

        if (lancamento == null)
            return NotFound(new { message = "Lançamento não encontrado." });

        return Ok(lancamento);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LancamentoCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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

            _context.Lancamentos.Add(lancamento);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Lançamento criado com sucesso!" });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    success = false,
                    message = "Erro ao criar lançamento.",
                    error = ex.Message,
                }
            );
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Edit(int id, [FromBody] LancamentoEditDto dto)
    {
        if (id != dto.Id)
            return BadRequest(new { success = false, message = "ID do lançamento inválido." });

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = ObterUsuarioId();
            var lancamento = await _context.Lancamentos.FirstOrDefaultAsync(l =>
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

            _context.Lancamentos.Update(lancamento);
            await _context.SaveChangesAsync();

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

    [HttpDelete("{id}")]
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

        _context.Lancamentos.Remove(lancamento);
        await _context.SaveChangesAsync();

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
        return await _context
            .Lancamentos.Include(l => l.Parcelas)
            .FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == userId);
    }
}
