using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Cotacao.Controllers;

[Authorize]
public class PlanoContasController : Controller
{
    private readonly ApplicationDbContext _context;

    public PlanoContasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Exibe a árvore de planos de contas
    public IActionResult Index() => View();

    [HttpGet]
    public async Task<IActionResult> GetPlanoContas()
    {
        var userId = GetUserId();
        var contas = await _context
            .PlanosContas.Include(p => p.Filhos)
            .Include(p => p.Lancamentos)
            .Where(p => p.UsuarioId == userId)
            .ToListAsync();

        var contasDto = contas
            .Where(c => c.PlanoContasPaiId == null)
            .Select(c => MapPlanoConta(c))
            .ToList();

        return Ok(contasDto);
    }

    // GET: /Contas/GetContaEx -- Recebe uma unica conta para exclusão
    [HttpGet]
    public IActionResult GetPlanoContaEx(int id)
    {
        var userId = GetUserId();
        var planoConta = _context.PlanosContas.Find(id);
        if (planoConta == null)
            return NotFound();

        return Json(planoConta);
    }

    private PlanoContasDto MapPlanoConta(PlanoContasModel conta)
    {
        var totalLancamentos = conta.Lancamentos?.Sum(l => l.Valor) ?? 0;
        var filhos = conta.Filhos?.Select(f => MapPlanoConta(f)).ToList() ?? new();

        var totalFilhos = filhos.Sum(f => f.Total);
        var total = totalLancamentos + totalFilhos;

        return new PlanoContasDto
        {
            Id = conta.Id,
            Descricao = conta.Descricao ?? string.Empty,
            Tipo = conta.Tipo ?? string.Empty,
            PlanoContasPaiId = conta.PlanoContasPaiId,
            Total = total,
            Filhos = filhos,
        };
    }

    // GET: PlanoContas/Create
    public IActionResult CreatePlanoConta()
    {
        ViewBag.Tipos = new SelectList(new[] { "Receita", "Despesa" });
        ViewBag.Pais = new List<SelectListItem>();
        return View(new PlanoContasModel());
    }

    // POST: PlanoContas/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreatePlanoConta(PlanoContasModel plano)
    {
        var userId = GetUserId();
        if (ModelState.IsValid)
        {
            plano.UsuarioId = userId;

            _context.Add(plano);
            await _context.SaveChangesAsync();

            ModelState.Clear();

            // Retorna uma nova instancia pra limpar os campos
            ViewBag.Pais = await _context
                .PlanosContas.Where(p =>
                    p.Tipo == plano.Tipo && p.UsuarioId == userId && p.Id != plano.Id
                )
                .ToListAsync();

            return View(new PlanoContasModel());
        }

        var usuarioId = GetUserId();
        // Se não for valido o modestate, recarrega a lista de pais
        ViewBag.Pais = await _context
            .PlanosContas.Where(p =>
                p.Tipo == plano.Tipo && p.UsuarioId == usuarioId && p.Id != plano.Id
            )
            .ToListAsync();

        return View(plano);
    }

    // GET: /PlanoContas/EditPlanoConta/id
    public async Task<IActionResult> EditPlanoConta(int id)
    {
        var userId = GetUserId();

        var plano = await _context
            .PlanosContas.Include(p => p.Filhos)
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

        if (plano == null)
            return NotFound();

        var tipo = plano.Tipo;

        // Busca outros planos de contas do mesmo tipo tirando os seus filhos
        var outrosPais = await _context
            .PlanosContas.Where(p => p.UsuarioId == userId && p.Tipo == tipo && p.Id != plano.Id)
            .ToListAsync();

        var idsFilhos = GetTodosFilhosIds(plano);

        outrosPais = outrosPais.Where(p => !idsFilhos.Contains(p.Id)).ToList();

        var viewModel = new PlanoContasEditViewModel
        {
            Id = plano.Id,
            Descricao = plano.Descricao ?? string.Empty,
            Tipo = plano.Tipo ?? string.Empty,
            PlanoContasPaiId = plano.PlanoContasPaiId,
            PlanosContasPaisDisponiveis = outrosPais
                .Select(p => new SelectListItem { Value = p.Id.ToString(), Text = p.Descricao })
                .ToList(),
        };

        return View(viewModel);
    }

    // POST: /PlanoContas/EditPlanoConta/id
    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditPlanoConta(PlanoContasEditViewModel model)
    {
        var userId = GetUserId();
        if (!ModelState.IsValid)
        {
            // Carrega novamente os pais
            var candidatosPais = await _context
                .PlanosContas.Where(p =>
                    p.Tipo == model.Tipo && p.Id != model.Id && p.UsuarioId == userId
                )
                .ToListAsync();

            model.PlanosContasPaisDisponiveis = candidatosPais
                .Select(p => new SelectListItem { Value = p.Id.ToString(), Text = p.Descricao })
                .ToList();

            return View(model);
        }

        var plano = await _context.PlanosContas.FirstOrDefaultAsync(p =>
            p.Id == model.Id && p.UsuarioId == userId
        );
        if (plano == null)
            return NotFound();

        plano.Descricao = model.Descricao;
        plano.PlanoContasPaiId = model.PlanoContasPaiId;

        _context.Update(plano);
        await _context.SaveChangesAsync();

        return RedirectToAction("Index");
    }

    [HttpGet]
    public async Task<IActionResult> ObterPlanosPorTipo(string tipo)
    {
        var userId = GetUserId();
        var planos = await _context
            .PlanosContas.Where(p => p.Tipo == tipo && p.UsuarioId == userId)
            .OrderBy(p => p.Descricao)
            .Select(p => new { p.Id, p.Descricao })
            .ToListAsync();

        return Json(planos);
    }

    private List<int> GetTodosFilhosIds(PlanoContasModel conta)
    {
        var lista = new List<int>();
        if (conta.Filhos != null)
        {
            foreach (var filho in conta.Filhos)
            {
                lista.Add(filho.Id);
                lista.AddRange(GetTodosFilhosIds(filho));
            }
        }
        return lista;
    }

    [HttpDelete("PlanoContas/DeleteConfirmed/{id}")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var conta = await _context.PlanosContas.FindAsync(id);
        if (conta == null)
            return NotFound();

        // regra de validação: não pode excluir se tiver filhos
        bool temFilhos = await _context.PlanosContas.AnyAsync(p => p.PlanoContasPaiId == id);
        if (temFilhos)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possível excluir um plano de contas que possui filhos.",
                }
            );
        }

        bool temLancamentos = await _context.Lancamentos.AnyAsync(l => l.PlanoContaId == id);

        if (temLancamentos)
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possível excluir Plano de Contas com lançamentos vinculados.",
                }
            );
        }

        try
        {
            _context.PlanosContas.Remove(conta);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23503")
        {
            return BadRequest(
                new
                {
                    success = false,
                    message = "Não é possível excluir este plano de contas pois existem registros vinculados a ele.",
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
                    message = $"Ocorreu um erro inesperado ao tentar excluir o plano de contas. {ex}",
                }
            );
        }
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null || string.IsNullOrEmpty(claim.Value))
            throw new UnauthorizedAccessException("Usuário não autenticado.");

        var limpo = claim.Value.Trim('"');
        return int.Parse(limpo);
    }

    private async Task<PlanoContasModel?> GetPlan(int PlanoId)
    {
        var userId = GetUserId();
        return await _context
            .PlanosContas.Include(p => p.Filhos)
            .FirstOrDefaultAsync(p => p.Id == PlanoId && p.UsuarioId == userId);
    }
}
