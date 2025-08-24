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
    public class ContasController : Controller
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
    [Route("api/[controller]")]
    public class ContasApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ContasApiController> _logger;

        public ContasApiController(
            ApplicationDbContext context,
            ILogger<ContasApiController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Contas
        [HttpGet]
        public async Task<IActionResult> GetContas()
        {
            var userId = GetUserId();
            var contas = await _context
                .ContasBancarias.Where(c => c.UsuarioId == userId)
                .AsNoTracking()
                .ToListAsync();

            var resultado = contas
                .Select(c => new ContaBancaria
                {
                    Id = c.Id,
                    Descricao = c.Descricao,
                    NumeroConta = c.NumeroConta,
                    DigitoConta = c.DigitoConta,
                    Agencia = c.Agencia,
                    DigitoAgencia = c.DigitoAgencia,
                    Ativa = c.Ativa,
                    Banco = c.Banco,
                    Tipo = c.Tipo,
                    Saldo = c.Saldo,
                })
                .ToList();

            return Ok(resultado);
        }

        // GET: api/Contas/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetConta(int id)
        {
            var userId = GetUserId();
            var conta = await _context
                .ContasBancarias.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == userId);

            if (conta == null)
                return NotFound(new { success = false, message = "Conta não encontrada." });

            var resultado = new ContaBancaria
            {
                Id = conta.Id,
                Descricao = conta.Descricao,
                NumeroConta = conta.NumeroConta,
                DigitoConta = conta.DigitoConta,
                Agencia = conta.Agencia,
                DigitoAgencia = conta.DigitoAgencia,
                Ativa = conta.Ativa,
                Banco = conta.Banco,
                Tipo = conta.Tipo,
                Saldo = conta.Saldo,
            };

            return Ok(resultado);
        }

        // POST: api/Contas
        [HttpPost]
        public async Task<IActionResult> CreateConta([FromBody] CreateContaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var contaBancaria = new ContaBancaria
                {
                    // Mapeamento do DTO
                    Descricao = dto.Descricao,
                    // ...
                    UsuarioId = userId,
                };
                _context.ContasBancarias.Add(contaBancaria);
                await _context.SaveChangesAsync();
                return CreatedAtAction(
                    nameof(GetConta),
                    new { id = contaBancaria.Id },
                    contaBancaria
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar conta bancária.");
                return StatusCode(
                    500,
                    new { success = false, message = "Erro ao cadastrar conta." }
                );
            }
        }

        // PUT: api/Contas/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> EditConta(int id, [FromBody] EditContaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var contaExistente = await _context.ContasBancarias.FirstOrDefaultAsync(c =>
                c.Id == id && c.UsuarioId == userId
            );

            if (contaExistente == null)
                return NotFound(new { success = false, message = "Conta não encontrada." });

            contaExistente.Descricao = dto.Descricao;
            contaExistente.Banco = dto.Banco;
            contaExistente.Tipo = dto.Tipo;
            contaExistente.NumeroConta = dto.NumeroConta;
            contaExistente.DigitoAgencia = dto.DigitoAgencia;
            contaExistente.DigitoConta = dto.DigitoConta;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao editar conta {ContaId}", id);
                return StatusCode(500, new { success = false, message = "Erro ao editar conta." });
            }
        }

        // DELETE: api/Contas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConta(int id)
        {
            var userId = GetUserId();
            var conta = await _context.ContasBancarias.FirstOrDefaultAsync(c =>
                c.Id == id && c.UsuarioId == userId
            );

            if (conta == null)
            {
                return NotFound(new { success = false, message = "Conta não encontrada." });
            }

            // Adicionar verificação de lançamentos vinculados se necessário
            bool temLancamentos = await _context.Lancamentos.AnyAsync(l => l.ContaBancariaId == id);
            if (temLancamentos)
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir conta com lançamentos vinculados.",
                    }
                );
            }

            try
            {
                _context.ContasBancarias.Remove(conta);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir conta {ContaId}", id);
                return StatusCode(500, new { success = false, message = "Erro ao excluir conta." });
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
