using System.Security.Claims;
using System.Threading.Tasks;
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
    private readonly ILogger<PlanoContasController> _logger;

    public PlanoContasController(
        ApplicationDbContext context,
        ILogger<PlanoContasController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    // Exibe a árvore de planos de contas
    public IActionResult Index() => View();

    // GET: /PlanoContas/GetPlanoContas -- Busca todos os planos de contas do usuário
    [HttpGet]
    public async Task<IActionResult> GetPlanoContas()
    {
        try
        {
            var userId = GetUserId();
            // 1. Busca de todas as contas e seus lançamentos em uma única consulta
            var todasContas = await _context
                .PlanosContas.AsNoTracking()
                .Include(p => p.Lancamentos)
                .Where(p => p.UsuarioId == userId)
                .ToListAsync();

            // 2. Cria estrutura de dicionário para acesso rápido
            var contasPorId = todasContas.ToDictionary(c => c.Id);

            // 3. Reconstrói a hierarquia pai-filho em memória
            foreach (var conta in todasContas.Where(c => c.PlanoContasPaiId.HasValue))
            {
                if (contasPorId.TryGetValue(conta.PlanoContasPaiId.Value, out var pai))
                {
                    pai.Filhos ??= new List<PlanoContasModel>();
                    pai.Filhos.Add(conta);
                }
            }

            // 4. Aplica o mapeamento personalizado apenas nas contas raiz
            var contasDto = todasContas
                .Where(c => c.PlanoContasPaiId == null)
                .Select(c => MapPlanoConta(c))
                .ToList();

            return Ok(contasDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Erro ao buscar planos de contas para o usuário {UserId}",
                GetUserId()
            );
            return StatusCode(
                500,
                new
                {
                    Mensagem = "Ocorreu um erro ao processar sua requisição",
                    Detalhes = ex.Message,
                }
            );
        }
    }

    private PlanoContasDto MapPlanoConta(PlanoContasModel conta)
    {
        // Calcula totais de lançamentos da conta atual
        var totalLancamentos = conta.Lancamentos?.Sum(l => l.Valor) ?? 0;

        // Mapeia filhos recursivamente
        var filhosDto =
            conta.Filhos?.Select(f => MapPlanoConta(f)).ToList() ?? new List<PlanoContasDto>();

        // Calcula totais hierárquicos
        var totalFilhos = filhosDto.Sum(f => f.Total);
        var totalGeral = totalLancamentos + totalFilhos;

        return new PlanoContasDto
        {
            Id = conta.Id,
            Descricao = conta.Descricao ?? string.Empty,
            Tipo = conta.Tipo ?? string.Empty,
            PlanoContasPaiId = conta.PlanoContasPaiId,
            Total = totalGeral,
            Filhos = filhosDto,
            // Adicione outras propriedades conforme necessário
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
        try
        {
            if (ModelState.IsValid)
            {
                plano.UsuarioId = userId;

                _context.Add(plano);
                await _context.SaveChangesAsync();

                TempData["Notificacao"] =
                    $"Plano de contas '{plano.Descricao}' criado com sucesso!";

                ModelState.Clear();

                // Retorna uma nova instancia pra limpar os campos
                ViewBag.Pais = await _context
                    .PlanosContas.Where(p =>
                        p.Tipo == plano.Tipo && p.UsuarioId == userId && p.Id != plano.Id
                    )
                    .ToListAsync();

                return View(new PlanoContasModel());
            }
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Erro ao criar plano de contas");
            ModelState.AddModelError(
                "",
                "Ocorreu um erro ao salvar o plano de contas. Tente novamente."
            );
        }

        // Se não for valido o modestate, recarrega a lista de pais
        ViewBag.Pais = await _context
            .PlanosContas.Where(p =>
                p.Tipo == plano.Tipo && p.UsuarioId == userId && p.Id != plano.Id
            )
            .ToListAsync();

        return View(plano);
    }

    // GET: /PlanoContas/EditPlanoConta/id
    [HttpGet]
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
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditPlanoConta(PlanoContasEditViewModel model)
    {
        var userId = GetUserId();

        ModelState.Remove("Tipo");
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

            _logger.LogWarning("Modelo inválido ao editar plano de contas");
            ModelState.AddModelError("", "Por favor, corrija os erros abaixo.");

            return View(model);
        }
        try
        {
            var plano = await _context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == model.Id && p.UsuarioId == userId
            );

            if (plano == null)
                return NotFound();

            plano.Descricao = model.Descricao;
            plano.PlanoContasPaiId = model.PlanoContasPaiId;

            _context.Entry(plano).Property(p => p.Descricao).IsModified = true;
            _context.Entry(plano).Property(p => p.PlanoContasPaiId).IsModified = true;

            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao editar plano de contas, ID: {PlanoId}", model.Id);
            ModelState.AddModelError("", "Não foi possível editar o plano de contas.");

            return View(model);
        }
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
        var userId = GetUserId();
        var contaComFilhos = await _context
            .PlanosContas.Where(p => p.Id == id && p.UsuarioId == userId)
            .Select(p => new
            {
                Conta = p,
                TemFilhos = _context.PlanosContas.Any(f => f.PlanoContasPaiId == id),
            })
            .FirstOrDefaultAsync();

        if (contaComFilhos == null)
            return NotFound();

        // regra de validação: não pode excluir se tiver filhos
        if (contaComFilhos.TemFilhos)
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
            _context.PlanosContas.Remove(contaComFilhos.Conta);
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

    [HttpGet]
    public async Task<IActionResult> GetTotalPorPlano(
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        string tipoData = "vencimento"
    )
    {
        try
        {
            var userId = GetUserId();

            // if (!dataInicio.HasValue || !dataFim.HasValue)
            // {
            //     var hoje = DateTime.Today;
            //     dataInicio = new DateTime(hoje.Year, hoje.Month, 1);
            //     dataFim = dataInicio.Value.AddMonths(1).AddDays(-1);
            // }
            if (dataInicio.HasValue)
                dataInicio = DateTime.SpecifyKind(dataInicio.Value, DateTimeKind.Unspecified);

            if (dataFim.HasValue)
                dataFim = DateTime.SpecifyKind(dataFim.Value, DateTimeKind.Unspecified);

            var query = _context
                .Lancamentos.AsNoTracking()
                .Where(l => l.PlanoContas.UsuarioId == userId)
                .AsQueryable();

            if (dataInicio.HasValue && dataFim.HasValue)
            {
                query = tipoData.ToLower() switch
                {
                    "competencia" => query.Where(l =>
                        l.DataCompetencia >= dataInicio.Value && l.DataCompetencia <= dataFim.Value
                    ),
                    "lancamento" => query.Where(l =>
                        l.DataLancamento >= dataInicio.Value && l.DataLancamento <= dataFim.Value
                    ),
                    "pagamento" => query.Where(l =>
                        l.DataPagamento >= dataInicio.Value && l.DataPagamento <= dataFim.Value
                    ),
                    _ => query.Where(l =>
                        l.DataVencimento >= dataInicio.Value && l.DataVencimento <= dataFim.Value
                    ),
                };
            }

            var result = await query
                .GroupBy(l => new { l.PlanoContaId, l.PlanoContas.Descricao })
                .Select(g => new
                {
                    plano_conta_id = g.Key.PlanoContaId,
                    plano_conta_descricao = g.Key.Descricao,
                    total_valor = g.Sum(l => (decimal?)l.Valor) ?? 0,
                })
                .ToListAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter total por plano de contas");
            return StatusCode(
                500,
                new
                {
                    Mensagem = "Ocorreu um erro ao processar sua requisição",
                    Detalhes = ex.Message,
                }
            );
        }
    }
}
