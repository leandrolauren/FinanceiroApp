using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Authorize]
public class ContasController : Controller
{
    private readonly ApplicationDbContext _context;

    public ContasController(ApplicationDbContext context) => _context = context;

    // GET: Contas
    public IActionResult Index() => View();

    [HttpGet]
    public async Task<IActionResult> GetContas()
    {
        var userId = GetUserId();
        var contas = await _context.ContasBancarias.Where(c => c.UsuarioId == userId).ToListAsync();

        return Json(contas);
    }

    public IActionResult CreateConta() => View();

    // POST: Contas/Create
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
        conta.UsuarioId = userId;
        _context.Add(conta);
        await _context.SaveChangesAsync();
        TempData["MensagemSucesso"] = "Conta criada.";

        ModelState.Clear();

        return View(new ContaBancaria());
    }

    // GET: Contas/Edit/id
    public async Task<IActionResult> EditConta(int id)
    {
        var conta = await GetAccount(id);
        if (conta == null)
        {
            return Unauthorized();
        }

        return View(conta);
    }

    // POST: Contas/Edit/id
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditConta(ContaBancaria conta)
    {
        var contaExiste = await GetAccount(conta.Id);
        if (contaExiste == null)
            return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                conta.UsuarioId = contaExiste.UsuarioId;
                _context.Update(conta);

                await _context.SaveChangesAsync();
                TempData["MensagemSucesso"] = "Conta Alterada.";
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.WriteLine($"Erro ao fazer update: {ex}");
            }
            return RedirectToAction(nameof(Index));
        }
        return View(conta);
    }

    // GET: Contas/Delete/id
    public async Task<IActionResult> DeleteConta(int id)
    {
        var conta = await GetAccount(id);
        if (conta == null)
            return NotFound();

        return View(conta);
    }

    // POST: Contas/Delete/id
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var userId = GetUserId();
        var account = await _context.ContasBancarias.FirstOrDefaultAsync(c =>
            c.Id == id && c.UsuarioId == userId
        );

        if (account == null)
            return NotFound();

        _context.Remove(account);
        await _context.SaveChangesAsync();

        TempData["MensagemSucesso"] = "Conta excluída.";
        return RedirectToAction(nameof(Index));
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Unauthenticated user.");

        return int.Parse(claim.Value);
    }

    private async Task<ContaBancaria?> GetAccount(int ContaId)
    {
        var userId = GetUserId();
        return await _context
            .ContasBancarias.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == ContaId && c.UsuarioId == userId);
    }
}
