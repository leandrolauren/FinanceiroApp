using System.Data;
using System.Security.Claims;
using FinanceiroApp.Data;
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

    // GET: /Contas/GetContas
    [HttpGet]
    public async Task<IActionResult> GetContas()
    {
        var userId = GetUserId();
        var contas = await _context
            .ContasBancarias.Where(c => c.UsuarioId == userId)
            .Select(c => new ContaDto
            {
                Id = c.Id,
                Descricao = c.Descricao,
                NumeroConta = c.NumeroConta,
                Agencia = c.Agencia,
                DigitoAgencia = c.DigitoAgencia,
                DigitoConta = c.DigitoConta,
                Tipo = c.Tipo.ToString(),
                Saldo = c.Saldo,
                Ativa = c.Ativa,
                Banco = c.Banco,
                UsuarioId = c.UsuarioId,
            })
            .ToListAsync();

        return Json(contas);
    }

    // GET: /Contas/GetContaEx -- Recebe uma unica conta para exclusão
    [HttpGet]
    public IActionResult GetContaEx(int id)
    {
        var conta = _context.ContasBancarias.Find(id);
        if (conta == null)
            return NotFound();

        return Json(conta);
    }

    public IActionResult CreateConta() => View();

    // POST: /Contas/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateConta(ContaBancaria conta)
    {
        if (!ModelState.IsValid)
        {
            TempData["MensagemErro"] = "Preencha os campos obrigatórios.";
            return View(conta);
        }

        var userId = GetUserId();
        conta.Ativa = true;
        conta.UsuarioId = userId;
        _context.Add(conta);
        await _context.SaveChangesAsync();
        TempData["MensagemSucesso"] = "Conta criada.";

        ModelState.Clear();

        return View(new ContaBancaria { Descricao = string.Empty });
    }

    // GET: /Contas/Edit/id
    public async Task<IActionResult> EditConta(int id)
    {
        return await GetAccountOrNotFound(id, conta => Task.FromResult<IActionResult>(View(conta)));
    }

    // POST: Contas/Edit/id
    [HttpPost]
    public async Task<IActionResult> EditConta(ContaBancaria conta)
    {
        return await GetAccountOrNotFound(
            conta.Id,
            async contaExiste =>
            {
                if (!ModelState.IsValid)
                    return View(conta);
                try
                {
                    conta.UsuarioId = contaExiste.UsuarioId;

                    _context.Update(conta);
                    await _context.SaveChangesAsync();

                    return RedirectToAction(nameof(Index));
                }
                catch
                {
                    return View(conta);
                }
            }
        );
    }

    // POST: Contas/Delete/id
    [HttpDelete]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var conta = await _context.ContasBancarias.FindAsync(id);

        if (conta == null)
            return NotFound();

        bool temLancamentos = await _context.Lancamentos.AnyAsync(l => l.ContaBancariaId == id);
        if (temLancamentos)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possível excluir uma conta bancária que possui lançamentos vinculados.",
                }
            );
        }

        try
        {
            _context.Remove(conta);
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
                new { success = false, message = $"Erro ao excluir conta. {ex}" }
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

    private async Task<IActionResult> GetAccountOrNotFound(
        int contaId,
        Func<ContaBancaria, Task<IActionResult>> onFound
    )
    {
        var userId = GetUserId();
        var conta = await _context
            .ContasBancarias.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == contaId && c.UsuarioId == userId);

        if (conta == null)
            return NotFound();

        return await onFound(conta);
    }
}
