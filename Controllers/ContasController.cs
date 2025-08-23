using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FinanceiroApp.Controllers;

[Authorize]
public class ContasController : Controller
{
    private readonly ApplicationDbContext _context;

    public ContasController(ApplicationDbContext context) => _context = context;

    // GET: Contas
    public IActionResult Index() => View();

    // GET: Contas/Create
    public IActionResult Create() => View();

    // GET: Contas/Edit/5
    public IActionResult Edit(int id)
    {
        ViewBag.Id = id;
        return View();
    }

    [HttpGet("/api/ListaContas")]
    public async Task<IActionResult> GetContas()
    {
        var userId = GetUserId();
        var contas = await _context
            .ContasBancarias.Where(c => c.UsuarioId == userId)
            .Select(c => new ListaContaDto
            {
                Id = c.Id,
                Descricao = c.Descricao,
                NumeroConta = c.NumeroConta,
                Agencia = c.Agencia,
                DigitoAgencia = c.DigitoAgencia,
                DigitoConta = c.DigitoConta,
                Tipo = c.Tipo,
                Saldo = c.Saldo,
                Ativa = c.Ativa,
                Banco = c.Banco,
                UsuarioId = c.UsuarioId,
            })
            .ToListAsync();

        return Json(contas);
    }

    // GET: /Contas/{id}
    [HttpGet("/api/Contas/{id}")]
    public async Task<IActionResult> GetConta(int id)
    {
        var userId = GetUserId();
        var conta = await _context
            .ContasBancarias.Where(c => c.Id == id && c.UsuarioId == userId)
            .Select(c => new ContaBancaria
            {
                Id = c.Id,
                Descricao = c.Descricao,
                NumeroConta = c.NumeroConta,
                Agencia = c.Agencia,
                DigitoAgencia = c.DigitoAgencia,
                DigitoConta = c.DigitoConta,
                Tipo = c.Tipo,
                Saldo = c.Saldo,
                Ativa = c.Ativa,
                Banco = c.Banco,
            })
            .FirstOrDefaultAsync();

        if (conta == null)
        {
            return NotFound(new { success = false, message = "Conta não encontrada." });
        }

        return Ok(conta);
    }

    // POST: Contas/Create
    [HttpPost("/api/contas/Create")]
    public async Task<IActionResult> CreateConta([FromBody] CreateContaDto conta)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Values.SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { success = false, errors = errors });
        }
        try
        {
            var userId = GetUserId();
            var contaBancaria = new ContaBancaria
            {
                Descricao = conta.Descricao,
                NumeroConta = conta.NumeroConta,
                Agencia = conta.Agencia,
                DigitoAgencia = conta.DigitoAgencia,
                DigitoConta = conta.DigitoConta,
                Tipo = conta.Tipo,
                Ativa = conta.Ativa,
                Banco = conta.Banco,
                UsuarioId = userId,
            };
            _context.ContasBancarias.Add(contaBancaria);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new { success = false, message = $"Erro ao cadastrar conta: {ex.Message}" }
            );
        }
    }

    // PATCH: Contas/Edit/5
    [HttpPatch("/api/Contas/Edit/{id}")]
    public async Task<IActionResult> EditConta(int id, [FromBody] EditContaDto conta)
    {
        if (id <= 0)
            return BadRequest(new { success = false, message = "ID inválido." });

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Values.SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { success = false, errors = errors });
        }
        try
        {
            var userId = GetUserId();

            var contaExistente = await _context.ContasBancarias.FirstOrDefaultAsync(c =>
                c.Id == id && c.UsuarioId == userId
            );

            if (contaExistente == null)
            {
                return NotFound(
                    new
                    {
                        success = false,
                        message = "Conta não encontrada ou não pertence ao usuário.",
                    }
                );
            }

            contaExistente.Descricao = conta.Descricao;
            contaExistente.NumeroConta = conta.NumeroConta;
            contaExistente.Agencia = conta.Agencia;
            contaExistente.DigitoAgencia = conta.DigitoAgencia;
            contaExistente.DigitoConta = conta.DigitoConta;
            contaExistente.Tipo = conta.Tipo;
            contaExistente.Banco = conta.Banco;
            contaExistente.Ativa = conta.Ativa;

            _context.ContasBancarias.Update(contaExistente);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new { success = false, message = $"Erro ao editar conta: {ex.Message}" }
            );
        }
    }

    [HttpDelete("/api/Contas/Delete/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var conta = await _context.ContasBancarias.FirstOrDefaultAsync(c =>
            c.Id == id && c.UsuarioId == userId
        );
        if (conta == null)
        {
            return NotFound(new { success = false, message = "Conta não encontrada." });
        }
        try
        {
            _context.ContasBancarias.Remove(conta);
            await _context.SaveChangesAsync();
            return Ok(new { sucess = true });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23503")
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possivel excluir essa conta bancária pois existem lançamentos vinculados a ela.",
                }
            );
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new { success = false, message = $"Erro ao excluir conta. {ex.Message}" }
            );
        }
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Unauthenticated user.");

        return int.Parse(claim.Value);
    }
}
