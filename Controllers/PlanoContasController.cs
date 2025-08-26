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

        // --- MÉTODOS PARA RAZOR VIEWS ---

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

        // --- API ENDPOINTS ---

        [HttpGet("api/planoContas/hierarquia")]
        public async Task<IActionResult> GetHierarquiaPlanoContas(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string tipoData = "vencimento"
        )
        {
            try
            {
                var userId = GetUserId();

                // PASSO 1: Buscar todas as contas do usuário de uma só vez.
                var todasContas = await _context
                    .PlanosContas.Where(p => p.UsuarioId == userId)
                    .AsNoTracking()
                    .ToListAsync();

                if (todasContas.Count == 0)
                    return Ok(new List<PlanoContasDto>());

                var idsDasContas = todasContas.Select(c => c.Id).ToList();

                // Configuração das datas de filtro
                var hoje = DateTime.Today;
                var dtInicio = dataInicio ?? new DateTime(hoje.Year, hoje.Month, 1);
                var dtFim = dataFim ?? dtInicio.AddMonths(1).AddDays(-1);

                // PASSO 2: Buscar todos os lançamentos relevantes em uma única consulta ao banco.
                var queryLancamentos = _context
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

                // PASSO 3: Agrupar e somar os totais em memória (extremamente rápido).
                var totaisPorConta = (await queryLancamentos.ToListAsync())
                    .GroupBy(l => l.PlanoContaId)
                    .ToDictionary(g => g.Key, g => g.Sum(l => l.Valor));

                // PASSO 4: Mapear para DTOs e construir a árvore hierárquica.
                var contasDtoPorId = todasContas.ToDictionary(
                    c => c.Id,
                    c => new PlanoContasDto
                    {
                        Id = c.Id,
                        Descricao = c.Descricao,
                        Tipo = c.Tipo,
                        PlanoContasPaiId = c.PlanoContasPaiId,
                        // Atribui o total direto da conta (se houver)
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
                _logger.LogError(
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

        [HttpGet("api/planoContas/{id}")]
        public async Task<IActionResult> GetPlanoConta(int id)
        {
            var userId = GetUserId();
            var plano = await _context
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

        [HttpPost("api/planoContas")]
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

                _context.Add(plano);
                await _context.SaveChangesAsync();

                return new { id = plano.Id };
            }
            catch (Exception ex)
            {
                _logger.LogError(
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

        [HttpPut("api/planoContas/{id}")]
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
            var planoDb = await _context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );
            if (planoDb == null)
                return NotFound(new { message = "Plano de contas não encontrado." });

            var lancamentosExistentes = await _context
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
                        message = "Esta conta possui lançamentos. Para movê-la, os lançamentos serão migrados para uma nova sub-conta. Confirma a operação?",
                        requerConfirmacao = true,
                    }
                );
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
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
                    _context.PlanosContas.Add(novoPlanoFilho);
                    await _context.SaveChangesAsync();

                    foreach (var lancamento in lancamentosExistentes)
                    {
                        lancamento.PlanoContaId = novoPlanoFilho.Id;
                    }
                    _context.Lancamentos.UpdateRange(lancamentosExistentes);
                }

                planoDb.Descricao = dto.Descricao;
                planoDb.PlanoContasPaiId = dto.PlanoContasPaiId;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erro ao editar plano de contas {PlanoId}", id);
                return StatusCode(500, new { message = "Erro ao salvar as alterações." });
            }
        }

        [HttpDelete("api/planoContas/{id}")]
        public async Task<IActionResult> DeletePlanoConta(int id)
        {
            var userId = GetUserId();
            var conta = await _context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (conta == null)
                return NotFound(
                    new { success = false, message = "Plano de contas não encontrado." }
                );

            if (await _context.PlanosContas.AnyAsync(f => f.PlanoContasPaiId == id))
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir uma conta que possui filhos.",
                    }
                );
            }

            if (await _context.Lancamentos.AnyAsync(l => l.PlanoContaId == id))
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir uma conta com lançamentos vinculados.",
                    }
                );
            }

            try
            {
                _context.PlanosContas.Remove(conta);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir plano de contas {PlanoId}", id);
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

        [HttpGet("api/planoContas/{id}/ehpai")]
        public async Task<IActionResult> IsPai(int id)
        {
            var userId = GetUserId();
            var temFilhos = await _context.PlanosContas.AnyAsync(p =>
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
