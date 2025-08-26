using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers
{
    [Authorize]
    public class PlanoContasController : Controller
    {
        // GET: /PlanoContas
        public IActionResult Index() => View();

        // GET: /PlanoContas/Create
        public IActionResult Create() => View();

        // GET: /PlanoContas/Edit/{id}
        public IActionResult Edit(int id)
        {
            ViewBag.Id = id;
            return View();
        }
    }

    // --- API ENDPOINTS ---
    [Authorize]
    [ApiController]
    [Route("api/")]
    public class PlanoContasApiController(
        ApplicationDbContext context,
        ILogger<PlanoContasController> logger
    ) : ControllerBase
    {
        // GET: /api/planoContas/hierarquia
        [HttpGet("planoContas/hierarquia")]
        public async Task<IActionResult> GetHierarquiaPlanoContas(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string tipoData = "vencimento"
        )
        {
            try
            {
                var userId = GetUserId();

                var todasContas = await context
                    .PlanosContas.Where(p => p.UsuarioId == userId)
                    .AsNoTracking()
                    .ToListAsync();

                if (todasContas.Count == 0)
                    return Ok(new List<PlanoContasDto>());

                var idsDasContas = todasContas.Select(c => c.Id).ToList();

                var hoje = DateTime.Today;
                var dtInicio = dataInicio ?? new DateTime(hoje.Year, hoje.Month, 1);
                var dtFim = dataFim ?? dtInicio.AddMonths(1).AddDays(-1);

                var queryLancamentos = context
                    .Lancamentos.AsNoTracking()
                    .Where(l => idsDasContas.Contains(l.PlanoContaId));

                queryLancamentos = tipoData.ToLower() switch
                {
                    "competencia" => queryLancamentos.Where(l =>
                        l.DataCompetencia >= dtInicio && l.DataCompetencia <= dtFim
                    ),
                    "lancamento" => queryLancamentos.Where(l =>
                        l.DataLancamento >= dtInicio && l.DataLancamento <= dtFim
                    ),
                    "pagamento" => queryLancamentos.Where(l =>
                        l.DataPagamento.HasValue
                        && l.DataPagamento >= dtInicio
                        && l.DataPagamento <= dtFim
                    ),
                    _ => queryLancamentos.Where(l =>
                        l.DataVencimento >= dtInicio && l.DataVencimento <= dtFim
                    ),
                };

                var totaisPorConta = (await queryLancamentos.ToListAsync())
                    .GroupBy(l => l.PlanoContaId)
                    .ToDictionary(g => g.Key, g => g.Sum(l => l.Valor));

                var contasDtoPorId = todasContas.ToDictionary(
                    c => c.Id,
                    c => new PlanoContasDto
                    {
                        Id = c.Id,
                        Descricao = c.Descricao,
                        Tipo = c.Tipo,
                        PlanoContasPaiId = c.PlanoContasPaiId,
                        Total = totaisPorConta.GetValueOrDefault(c.Id, 0),
                    }
                );

                var contasRaiz = new List<PlanoContasDto>();
                foreach (var conta in todasContas)
                {
                    if (
                        conta.PlanoContasPaiId.HasValue
                        && contasDtoPorId.TryGetValue(conta.PlanoContasPaiId.Value, out var paiDto)
                    )
                    {
                        paiDto.Filhos.Add(contasDtoPorId[conta.Id]);
                    }
                    else
                    {
                        contasRaiz.Add(contasDtoPorId[conta.Id]);
                    }
                }

                // PASSO 5: Calcular os totais hierárquicos (somar filhos nos pais).
                foreach (var contaRaiz in contasRaiz)
                    CalcularTotalHierarquico(contaRaiz);

                return Ok(contasRaiz);
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex,
                    "Erro ao buscar a hierarquia do plano de contas para o usuário {UserId}",
                    GetUserId()
                );
                return StatusCode(
                    500,
                    new
                    {
                        message = "Ocorreu um erro ao processar sua requisição.",
                        details = ex.Message,
                    }
                );
            }
        }

        private decimal CalcularTotalHierarquico(PlanoContasDto contaDto)
        {
            if (contaDto.Filhos == null || contaDto.Filhos.Count == 0)
                return contaDto.Total;

            decimal totalFilhos = 0;

            foreach (var filho in contaDto.Filhos)
                totalFilhos += CalcularTotalHierarquico(filho);

            contaDto.Total += totalFilhos;
            return contaDto.Total;
        }

        [HttpGet("planoContas/{id}")]
        public async Task<IActionResult> GetPlanoConta(int id)
        {
            var userId = GetUserId();
            var plano = await context
                .PlanosContas.AsNoTracking()
                .Select(p => new PlanoContaCriadoDto
                {
                    Id = p.Id,
                    Descricao = p.Descricao,
                    Tipo = p.Tipo,
                    PlanoContasPaiId = p.PlanoContasPaiId,
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plano == null)
                return NotFound(new { message = "Plano de contas não encontrado." });

            return Ok(plano);
        }

        [HttpPost("planoContas")]
        public async Task<Object> CreatePlanoConta([FromBody] CriarPlanoContaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var plano = new PlanoContasModel
                {
                    Descricao = dto.Descricao,
                    Tipo = dto.Tipo,
                    PlanoContasPaiId = dto.PlanoContasPaiId,
                    UsuarioId = userId,
                };

                context.Add(plano);
                await context.SaveChangesAsync();

                return new { id = plano.Id };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex,
                    "Erro ao criar plano de contas para o usuário {UserId}",
                    GetUserId()
                );
                return StatusCode(
                    500,
                    new { message = "Ocorreu um erro ao criar o plano de contas." }
                );
            }
        }

        [HttpGet("planoContas/pais")]
        public async Task<IActionResult> GetPlanosContasPai()
        {
            var userId = GetUserId();

            var planos = await context
                .PlanosContas.AsNoTracking()
                .Where(p => p.UsuarioId == userId)
                .OrderBy(p => p.Descricao)
                .Select(p => new
                {
                    p.Id,
                    p.Descricao,
                    p.Tipo,
                })
                .ToListAsync();

            return Ok(planos);
        }

        [HttpPut("planoContas/{id}")]
        public async Task<IActionResult> EditPlanoConta(
            int id,
            [FromBody] EditPlanoContaDto dto,
            [FromQuery] bool confirmarMigracao = false
        )
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            if (id <= 0)
                return BadRequest(new { message = "ID do plano de contas inválido." });

            var userId = GetUserId();
            var planoDb = await context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );
            if (planoDb == null)
                return NotFound(new { message = "Plano de contas não encontrado." });

            var lancamentosExistentes = await context
                .Lancamentos.Where(l => l.PlanoContaId == id)
                .ToListAsync();
            bool precisaMigrar =
                lancamentosExistentes.Any()
                && planoDb.PlanoContasPaiId != dto.PlanoContasPaiId
                && dto.PlanoContasPaiId.HasValue;

            if (precisaMigrar && !confirmarMigracao)
            {
                return Conflict(
                    new
                    {
                        success = false,
                        message = "Este plano de contas possui lançamentos. Para movê-la, os lançamentos serão migrados para um novo plano. Confirma a operação?",
                        requerConfirmacao = true,
                    }
                );
            }

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (precisaMigrar && confirmarMigracao)
                {
                    var novoPlanoFilho = new PlanoContasModel
                    {
                        Descricao = "Lançamentos Migrados de " + planoDb.Descricao,
                        Tipo = planoDb.Tipo,
                        PlanoContasPaiId = planoDb.Id,
                        UsuarioId = userId,
                    };
                    context.PlanosContas.Add(novoPlanoFilho);
                    await context.SaveChangesAsync();

                    foreach (var lancamento in lancamentosExistentes)
                    {
                        lancamento.PlanoContaId = novoPlanoFilho.Id;
                    }
                    context.Lancamentos.UpdateRange(lancamentosExistentes);
                }

                planoDb.Descricao = dto.Descricao;
                planoDb.PlanoContasPaiId = dto.PlanoContasPaiId;
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Erro ao editar plano de contas {PlanoId}", id);
                return StatusCode(500, new { message = "Erro ao salvar as alterações." });
            }
        }

        [HttpDelete("planoContas/{id}")]
        public async Task<IActionResult> DeletePlanoConta(int id)
        {
            var userId = GetUserId();
            var conta = await context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (conta == null)
                return NotFound(
                    new { success = false, message = "Plano de contas não encontrado." }
                );

            if (await context.PlanosContas.AnyAsync(f => f.PlanoContasPaiId == id))
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir um plano que possui filhos.",
                    }
                );
            }

            if (await context.Lancamentos.AnyAsync(l => l.PlanoContaId == id))
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir um Plano de Contas que possui lançamentos.",
                    }
                );
            }

            try
            {
                context.PlanosContas.Remove(conta);
                await context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao excluir plano de contas {PlanoId}", id);
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message = "Ocorreu um erro interno ao excluir o plano de contas.",
                    }
                );
            }
        }

        [HttpGet("planoContas/{id}/ehpai")]
        public async Task<IActionResult> IsPai(int id)
        {
            var userId = GetUserId();
            var temFilhos = await context.PlanosContas.AnyAsync(p =>
                p.PlanoContasPaiId == id && p.UsuarioId == userId
            );
            return Ok(new { isPai = temFilhos });
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Usuário não autenticado.");
            return int.Parse(claim.Value);
        }
    }
}
