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
        var userId = getUserId();
        var pessoas = await _context.Pessoas.Where(p => p.UsuarioId == userId).ToListAsync();
        return Json(pessoas);
    }

    // GET: Pessoa -- Recebe uma unica pessoa para exclusão
    [HttpGet]
    public IActionResult GetPessoa(int id)
    {
        var pessoa = _context.Pessoas.Find(id);
        if (pessoa == null)
            return NotFound();

        return Json(pessoa);
    }

    public IActionResult CreatePessoa() => View();

    // POST: Pessoas/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreatePessoa(PessoaModel pessoa)
    {
        if (!ModelState.IsValid)
            return View(pessoa);

        var userId = getUserId();
        pessoa.UsuarioId = userId;
        _context.Add(pessoa);
        await _context.SaveChangesAsync();
        TempData["MensagemSucesso"] = "Pessoa cadastrada.";

        ModelState.Clear();

        return View("CreatePessoa");
    }

    // GET: Pessoas/Edit/id
    [HttpGet]
    public async Task<IActionResult> EditPessoa(int id)
    {
        var pessoa = await getPerson(id);
        if (pessoa == null)
            return Unauthorized();

        return View(pessoa);
    }

    // POST: Pessoas/Edit/id
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditPessoa(PessoaModel pessoa)
    {
        var pessoaExiste = await getPerson(pessoa.Id);
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
    [HttpGet]
    public async Task<IActionResult> DeletePessoa(int id)
    {
        var pessoa = await getPerson(id);
        if (pessoa == null)
            return NotFound();

        return View(pessoa);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var userId = getUserId();

        var pessoa = await _context
            .Pessoas.Include(p => p.Lancamentos)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

        if (pessoa == null)
            return NotFound(new { mensagem = "Pessoa não encontrada." });

        if (pessoa.Lancamentos.Any())
        {
            return BadRequest(
                new
                {
                    mensagem = "Esta pessoa não pode ser excluída pois está vinculada a pelo menos um lançamento.",
                }
            );
        }

        _context.Pessoas.Remove(pessoa);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Pessoa excluída com sucesso." });
    }

    private async Task<PessoaModel?> getPerson(int PessoaId)
    {
        var userId = getUserId();
        return await _context
            .Pessoas.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == PessoaId && p.UsuarioId == userId);
    }

    private int getUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Usuário não autenticado.");

        return int.Parse(claim.Value);
    }
}
