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
        public IActionResult Index() => View();

        public IActionResult Create() => View();

        public IActionResult Edit(int id)
        {
            ViewBag.Id = id;
            return View();
        }
    }

    [Authorize]
    [ApiController]
    [Route("api/")]
    public class PlanoContasApiController(
        ApplicationDbContext context,
        ILogger<PlanoContasController> logger
    ) : ControllerBase
    {
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
                        Tipo = (TipoLancamento)c.Tipo,
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
                .Where(p => p.UsuarioId == userId)
                .Select(p => new PlanoContaCriadoDto
                {
                    Id = p.Id,
                    Descricao = p.Descricao,
                    Tipo = (TipoLancamento)p.Tipo,
                    PlanoContasPaiId = p.PlanoContasPaiId,
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plano == null)
                return NotFound(new { message = "Plano de contas não encontrado." });

            return Ok(plano);
        }

        [HttpPost("planoContas")]
        public async Task<IActionResult> CreatePlanoConta(
            [FromBody] CriarPlanoContaDto dto,
            [FromQuery] bool confirmarMigracao = false
        )
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            if (dto.PlanoContasPaiId.HasValue)
            {
                var paiTemLancamentos = await context.Lancamentos.AnyAsync(l =>
                    l.PlanoContaId == dto.PlanoContasPaiId.Value && l.UsuarioId == userId
                );
                if (paiTemLancamentos && !confirmarMigracao)
                {
                    return Conflict(
                        new
                        {
                            success = false,
                            message = "O plano de contas pai selecionado possui lançamentos. Confirma a migração destes lançamentos para o novo plano que está sendo criado?",
                            requerConfirmacao = true,
                        }
                    );
                }
            }

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var plano = new PlanoContasModel
                {
                    Descricao = dto.Descricao,
                    Tipo = (MovimentoTipo)dto.Tipo,
                    PlanoContasPaiId = dto.PlanoContasPaiId,
                    UsuarioId = userId,
                };
                context.Add(plano);
                await context.SaveChangesAsync();

                if (dto.PlanoContasPaiId.HasValue && confirmarMigracao)
                {
                    await MigrarLancamentosDoPaiAsync(dto.PlanoContasPaiId.Value, plano.Id, userId);
                }

                await transaction.CommitAsync();
                return Ok(new { id = plano.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
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

        [HttpPost("planoContas/{idOrigem}/migrar")]
        public async Task<IActionResult> MigrarLancamentos(
            int idOrigem,
            [FromBody] MigracaoPlanoContaDto dto
        )
        {
            if (idOrigem <= 0 || dto.PlanoContaDestinoId <= 0)
                return BadRequest(new { message = "IDs de origem e destino são obrigatórios." });

            if (idOrigem == dto.PlanoContaDestinoId)
                return BadRequest(
                    new { message = "A conta de origem e destino não podem ser a mesma." }
                );

            var userId = GetUserId();
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var contaOrigem = await context.PlanosContas.FirstOrDefaultAsync(p =>
                    p.Id == idOrigem && p.UsuarioId == userId
                );
                var contaDestino = await context.PlanosContas.FirstOrDefaultAsync(p =>
                    p.Id == dto.PlanoContaDestinoId && p.UsuarioId == userId
                );

                if (contaOrigem == null || contaDestino == null)
                    return NotFound(
                        new { message = "Plano de contas de origem ou destino não encontrado." }
                    );

                if (contaOrigem.Tipo != contaDestino.Tipo)
                    return BadRequest(
                        new
                        {
                            message = "A migração só pode ser feita entre planos de contas do mesmo tipo (Receita/Despesa).",
                        }
                    );

                var destinoEhPai = await context.PlanosContas.AnyAsync(p =>
                    p.PlanoContasPaiId == dto.PlanoContaDestinoId
                );
                if (destinoEhPai)
                    return BadRequest(
                        new
                        {
                            message = "Não é permitido migrar lançamentos para um plano de contas que é pai.",
                        }
                    );

                var lancamentosParaMigrar = await context
                    .Lancamentos.Where(l => l.PlanoContaId == idOrigem && l.UsuarioId == userId)
                    .ToListAsync();

                if (lancamentosParaMigrar.Count == 0)
                    return Ok(new { message = "Nenhum lançamento encontrado para migrar." });

                foreach (var lancamento in lancamentosParaMigrar)
                    lancamento.PlanoContaId = dto.PlanoContaDestinoId;

                context.Lancamentos.UpdateRange(lancamentosParaMigrar);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "Lançamentos migrados com sucesso." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(
                    ex,
                    "Erro ao migrar lançamentos do plano de contas {PlanoIdOrigem}",
                    idOrigem
                );
                return StatusCode(
                    500,
                    new { message = "Ocorreu um erro interno durante a migração." }
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
                    p.PlanoContasPaiId,
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

            if (dto.PlanoContasPaiId.HasValue)
            {
                if (dto.PlanoContasPaiId.Value == id)
                    return BadRequest(
                        new { message = "Um plano de contas não pode ser pai de si mesmo." }
                    );

                var descendentes = await GetAllDescendantIdsAsync(id, userId);
                if (descendentes.Contains(dto.PlanoContasPaiId.Value))
                    return BadRequest(
                        new
                        {
                            message = "Não é possível definir um descendente como pai do plano de contas.",
                        }
                    );
            }

            var planoDb = await context.PlanosContas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );
            if (planoDb == null)
                return NotFound(new { message = "Plano de contas não encontrado." });

            if (dto.PlanoContasPaiId.HasValue && dto.PlanoContasPaiId != planoDb.PlanoContasPaiId)
            {
                var paiTemLancamentos = await context.Lancamentos.AnyAsync(l =>
                    l.PlanoContaId == dto.PlanoContasPaiId.Value
                );
                if (paiTemLancamentos)
                {
                    if (!confirmarMigracao)
                    {
                        return Conflict(
                            new
                            {
                                success = false,
                                message = "O novo plano de contas pai possui lançamentos. Confirma a migração destes lançamentos para o plano que você está editando?",
                                requerConfirmacao = true,
                            }
                        );
                    }
                }
            }

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (
                    dto.PlanoContasPaiId.HasValue
                    && dto.PlanoContasPaiId != planoDb.PlanoContasPaiId
                    && confirmarMigracao
                )
                {
                    await MigrarLancamentosDoPaiAsync(dto.PlanoContasPaiId.Value, id, userId);
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
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir um plano que possui filhos.",
                    }
                );

            if (await context.Lancamentos.AnyAsync(l => l.PlanoContaId == id))
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir um Plano de Contas que possui lançamentos.",
                    }
                );

            context.PlanosContas.Remove(conta);
            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("planoContas/{id}/descendentes")]
        public async Task<IActionResult> GetDescendentes(int id)
        {
            var userId = GetUserId();
            var descendentes = await GetAllDescendantIdsAsync(id, userId);
            return Ok(descendentes);
        }

        private async Task<List<int>> GetAllDescendantIdsAsync(int parentId, int userId)
        {
            var descendentes = new List<int>();
            var filhos = await context
                .PlanosContas.Where(p => p.PlanoContasPaiId == parentId && p.UsuarioId == userId)
                .Select(p => p.Id)
                .ToListAsync();

            if (filhos.Count == 0)
                return descendentes;
            descendentes.AddRange(filhos);

            foreach (var filhoId in filhos)
                descendentes.AddRange(await GetAllDescendantIdsAsync(filhoId, userId));

            return descendentes;
        }

        private async Task MigrarLancamentosDoPaiAsync(int paiId, int idPlanoDestino, int userId)
        {
            var lancamentosDoPai = await context
                .Lancamentos.Where(l => l.PlanoContaId == paiId && l.UsuarioId == userId)
                .ToListAsync();

            if (lancamentosDoPai.Any())
            {
                foreach (var lancamento in lancamentosDoPai)
                {
                    lancamento.PlanoContaId = idPlanoDestino;
                }
                context.Lancamentos.UpdateRange(lancamentosDoPai);
                await context.SaveChangesAsync();
            }
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
