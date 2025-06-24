using System.Security.Claims;
using System.Threading.Tasks;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Authorize]
public class PessoasController : Controller
{
    private readonly ApplicationDbContext _context;

    public PessoasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: Pessoas
    public IActionResult Index() => View();

    public async Task<IActionResult> GetPessoas()
    {
        var userId = ObterUsuarioId();
        var pessoas = await _context.Pessoas.Where(p => p.UsuarioId == userId).ToListAsync();
        return Json(pessoas);
    }

    public IActionResult CreatePessoa() => View();

    // POST: Pessoas/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreatePessoa(PessoaModel pessoa)
    {
        if (!ModelState.IsValid)
        {
            TempData["MensagemErro"] = "Preencha os campos obrigatórios.";
            return View(pessoa);
        }
        var userId = ObterUsuarioId();
        pessoa.UsuarioId = userId;
        _context.Add(pessoa);
        await _context.SaveChangesAsync();
        TempData["MensagemSucesso"] = "Pessoa cadastrada.";

        ModelState.Clear();

        return View(new PessoaModel());
    }

    // GET: Pessoas/Edit/id
    public async Task<IActionResult> EditPessoa(int id)
    {
        var pessoa = await ObterPessoa(id);
        if (pessoa == null)
            return Unauthorized();

        return View(pessoa);
    }

    // POST: Pessoas/Edit/id
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditPessoa(PessoaModel pessoa)
    {
        var pessoaExiste = await ObterPessoa(pessoa.Id);
        if (pessoaExiste == null)
            return NotFound();

        if (ModelState.IsValid)
        {
            try
            {
                pessoa.UsuarioId = pessoaExiste.UsuarioId;
                _context.Update(pessoa);
                await _context.SaveChangesAsync();
                TempData["MensagemSucesso"] = "Pessoa alterada.";
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.WriteLine($"Erro ao fazer update: {ex}");
            }
            return RedirectToAction(nameof(Index));
        }
        return View(pessoa);
    }

    // GET: Pessoas/Delete/id
    public async Task<IActionResult> DeletePessoa(int id)
    {
        var pessoa = await ObterPessoa(id);
        if (pessoa == null)
            return NotFound();

        return View(pessoa);
    }

    // POST
    [HttpPost, ActionName("DeleteConfirmed")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var userId = ObterUsuarioId();

        var pessoa = await _context
            .Pessoas.Include(p => p.Lancamentos)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

        if (pessoa == null)
            return NotFound();

        if (pessoa.Lancamentos.Any())
        {
            TempData["MensagemErro"] =
                "Esta pessoa não pode ser excluída pois está vinculada a pelo menos um lançamento.";
            return RedirectToAction(nameof(Index));
        }

        _context.Pessoas.Remove(pessoa);
        await _context.SaveChangesAsync();

        TempData["MensagemSucesso"] = "Pessoa excluída.";
        return RedirectToAction(nameof(Index));
    }

    private async Task<PessoaModel?> ObterPessoa(int PessoaId)
    {
        var userId = ObterUsuarioId();
        return await _context
            .Pessoas.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == PessoaId && p.UsuarioId == userId);
    }

    private int ObterUsuarioId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Usuário não autenticado.");

        return int.Parse(claim.Value);
    }
}
