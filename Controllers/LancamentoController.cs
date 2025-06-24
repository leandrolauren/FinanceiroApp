using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Authorize]
public class LancamentosController : Controller
{
    private readonly ApplicationDbContext _context;

    public LancamentosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: Lancamentos
    public IActionResult Index() => View();

    public async Task<IActionResult> GetLancamentos()
    {
        var userId = ObterUsuarioId();
        var lancamentos = await _context
            .Lancamentos.Include(l => l.ContaBancaria)
            .Include(l => l.PlanoContas)
            .Include(l => l.Pessoa)
            .Where(l => l.UsuarioId == userId)
            .OrderByDescending(l => l.DataLancamento)
            .ToListAsync();

        return Json(lancamentos);
    }

    // GET: Lancamentos/Create
    public async Task<IActionResult> Create()
    {
        await PreencherViewBags();
        return View();
    }

    // POST: Lancamentos/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(LancamentoModel lancamento)
    {
        var userId = ObterUsuarioId();

        if (!ModelState.IsValid)
        {
            await PreencherViewBags();
            TempData["MensagemErro"] = "Preencha os campos obrigatórios.";
            return View(lancamento);
        }

        lancamento.UsuarioId = userId;
        lancamento.DataLancamento = DateTime.UtcNow;

        _context.Lancamentos.Add(lancamento);
        await _context.SaveChangesAsync();

        TempData["MensagemSucesso"] = "Lançamento cadastrado com sucesso.";
        return RedirectToAction(nameof(Index));
    }

    // GET: Lancamentos/Edit/id
    public async Task<IActionResult> EditLancamento(int id)
    {
        var userId = ObterUsuarioId();
        var lancamento = await _context.Lancamentos.FirstOrDefaultAsync(l =>
            l.Id == id && l.UsuarioId == userId
        );

        if (lancamento == null)
            return NotFound();

        await PreencherViewBags();
        return View(lancamento);
    }

    // POST: Lancamentos/Edit/id
    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditLancamento(LancamentoModel lancamento)
    {
        var userId = ObterUsuarioId();
        var lancamentoExistente = await _context.Lancamentos.FirstOrDefaultAsync(l =>
            l.Id == lancamento.Id && l.UsuarioId == userId
        );

        if (lancamentoExistente == null)
            return NotFound();

        if (!ModelState.IsValid)
        {
            await PreencherViewBags();
            TempData["MensagemErro"] = "Preencha os campos obrigatórios.";
            return View(lancamento);
        }

        lancamento.UsuarioId = userId;
        lancamento.DataLancamento = lancamentoExistente.DataLancamento; // manter original

        _context.Entry(lancamentoExistente).CurrentValues.SetValues(lancamento);
        await _context.SaveChangesAsync();

        TempData["MensagemSucesso"] = "Lançamento atualizado com sucesso.";
        return RedirectToAction(nameof(Index));
    }

    // GET: Lancamentos/Delete/id
    public async Task<IActionResult> Delete(int id)
    {
        var lancamento = await ObterLancamento(id);
        if (lancamento == null)
            return NotFound();

        return View(lancamento);
    }

    // POST: Lancamentos/DeleteConfirmed
    [HttpDelete]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var lancamento = await ObterLancamento(id);
        if (lancamento == null)
            return NotFound();

        if (lancamento.Parcelas?.Any() == true)
        {
            TempData["MensagemErro"] = "Este lançamento possui parcelas e não pode ser excluído.";
            return RedirectToAction(nameof(Index));
        }

        _context.Lancamentos.Remove(lancamento);
        await _context.SaveChangesAsync();

        TempData["MensagemSucesso"] = "Lançamento excluído com sucesso.";
        return RedirectToAction(nameof(Index));
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

    private async Task PreencherViewBags()
    {
        var userId = ObterUsuarioId();

        ViewBag.Pessoas = await _context.Pessoas.Where(p => p.UsuarioId == userId).ToListAsync();

        ViewBag.PlanosConta = await _context
            .PlanosContas.Where(pc => pc.UsuarioId == userId)
            .ToListAsync();

        ViewBag.ContasBancarias = await _context
            .ContasBancarias.Where(cb => cb.UsuarioId == userId)
            .ToListAsync();
    }
}
