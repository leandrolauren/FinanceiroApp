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
                        },
            })
            .ToListAsync();

        return Json(lancamentos);
    }

    // GET: Lancamentos/Create
    public async Task<IActionResult> CreateLancamento()
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
            return View("CreateLancamento", lancamento);
        }

        try
        {
            lancamento.UsuarioId = userId;
            lancamento.DataLancamento = DateTime.Now;

            _context.Lancamentos.Add(lancamento);
            await _context.SaveChangesAsync();

            TempData["MensagemSucesso"] = "Lançamento cadastrado com sucesso.";
            return View("CreateLancamento", lancamento);
        }
        catch (DBConcurrencyException ex)
        {
            TempData["MensagemErro"] =
                "Ocorreu um erro ao cadastrar o lançamento. Tente novamente.";
            Console.WriteLine($"Erro ao cadastrar lançamento: {ex}");
            await PreencherViewBags();
            return View("CreateLancamento", lancamento);
        }
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
    [HttpPost]
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

        return Json(lancamento);
    }

    // POST: Lancamentos/DeleteConfirmed
    [HttpDelete]
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
