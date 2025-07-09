using System.Security.Claims;
using System.Threading.Tasks;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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

    public IActionResult CreatePessoa() => View();

    // POST: Pessoas/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreatePessoa(PessoaModel pessoa)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.NotificacaoAlerta = "Dados invalidos. Preencha corretamente!";
            return View(pessoa);
        }
        try
        {
            var userId = getUserId();
            pessoa.UsuarioId = userId;

            _context.Add(pessoa);
            await _context.SaveChangesAsync();
            ViewBag.NotificacaoSucesso = "Pessoa cadastrada.";

            ModelState.Clear();
        }
        catch (DbUpdateException ex)
        {
            ViewBag.NotificacaoErro = "Ocorreu um erro ao salvar a pessoa. Tente novamente.";
            ModelState.AddModelError(
                "",
                $"Ocorreu um erro ao salvar a pessoa. Tente novamente. {ex.Message}"
            );
            return View(pessoa);
        }

        return View("CreatePessoa");
    }

    // GET: Pessoas/Edit/id
    [HttpGet]
    public async Task<IActionResult> EditPessoa(int id)
    {
        var pessoa = await getPessoa(id);
        if (pessoa == null)
            return Unauthorized();

        return View(pessoa);
    }

    // POST: Pessoas/Edit/id
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditPessoa(PessoaModel pessoa)
    {
        var pessoaExiste = await getPessoa(pessoa.Id);
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
        var pessoa = await getPessoa(id);
        if (pessoa == null)
            return NotFound();

        return View(pessoa);
    }

    [HttpDelete("Pessoas/DeleteConfirmed/{id}")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var userId = getUserId();

        var pessoa = await _context
            .Pessoas.Include(p => p.Lancamentos)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

        if (pessoa == null)
            return NotFound(new { message = "Pessoa não encontrada." });

        bool temLancamentos = await _context.Lancamentos.AnyAsync(l =>
            l.PessoaId == id && l.UsuarioId == userId
        );

        if (temLancamentos)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Esta pessoa não pode ser excluída pois está vinculada a pelo menos um lançamento.",
                }
            );
        }
        try
        {
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Pessoa excluída." });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23503")
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possivel excluir uma pessoa que está vinculada a lançamentos.",
                }
            );
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    success = false,
                    message = $"Erro inesperado ao excluir plano de contas: {ex}",
                }
            );
        }
    }

    private async Task<PessoaModel?> getPessoa(int PessoaId)
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
