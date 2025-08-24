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
    public class PessoasController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PessoasController> _logger;

        public PessoasController(ApplicationDbContext context, ILogger<PessoasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /Pessoas
        public IActionResult Index() => View();

        // GET: /Pessoas/Create
        public IActionResult Create() => View();

        // GET: /Pessoas/EditPessoa/{id}
        public IActionResult Edit(int id)
        {
            ViewBag.Id = id;
            return View();
        }
    }

    // --- API ENDPOINTS ---
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PessoasController> _logger;

        public PessoasApiController(ApplicationDbContext context, ILogger<PessoasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Pessoasapi
        [HttpGet]
        public async Task<IActionResult> GetPessoas()
        {
            var userId = GetUserId();
            var pessoas = await _context
                .Pessoas.Where(p => p.UsuarioId == userId)
                .AsNoTracking()
                .ToListAsync();
            return Ok(pessoas);
        }

        // GET: api/Pessoas/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPessoa(int id)
        {
            var userId = GetUserId();
            var pessoa = await _context
                .Pessoas.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

            if (pessoa == null)
            {
                return NotFound(new { success = false, message = "Pessoa não encontrada." });
            }
            return Ok(pessoa);
        }

        // POST: api/Pessoas
        [HttpPost]
        public async Task<object> CreatePessoa([FromBody] CriarPessoaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetUserId();
                var pessoa = new PessoaModel
                {
                    Nome = dto.Nome,
                    RazaoSocial = dto.RazaoSocial,
                    Tipo = dto.Tipo,
                    Email = dto.Email,
                    Telefone = dto.Telefone,
                    Endereco = dto.Endereco,
                    Numero = dto.Numero,
                    Bairro = dto.Bairro,
                    Complemento = dto.Complemento,
                    Cidade = dto.Cidade,
                    Estado = dto.Estado,
                    NomeFantasia = dto.NomeFantasia,
                    InscricaoEstadual = dto.InscricaoEstadual,
                    Cpf = dto.Cpf,
                    Rg = dto.Rg,
                    DataNascimento = dto.DataNascimento,
                    UsuarioId = userId,
                };

                _context.Pessoas.Add(pessoa);
                await _context.SaveChangesAsync();

                return new { id = pessoa.Id };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar pessoa.");
                return StatusCode(
                    500,
                    new { success = false, message = "Ocorreu um erro interno ao criar a pessoa." }
                );
            }
        }

        // PUT: api/Pessoas/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> EditPessoa(int id, [FromBody] EditPessoaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var pessoaDb = await _context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (pessoaDb == null)
            {
                return NotFound(new { success = false, message = "Pessoa não encontrada." });
            }

            pessoaDb.Nome = dto.Nome;
            pessoaDb.RazaoSocial = dto.RazaoSocial;
            pessoaDb.Tipo = dto.Tipo;
            pessoaDb.Email = dto.Email;
            pessoaDb.Telefone = dto.Telefone;
            pessoaDb.Endereco = dto.Endereco;
            pessoaDb.Numero = dto.Numero;
            pessoaDb.Bairro = dto.Bairro;
            pessoaDb.Complemento = dto.Complemento;
            pessoaDb.Cidade = dto.Cidade;
            pessoaDb.Estado = dto.Estado;
            pessoaDb.NomeFantasia = dto.NomeFantasia;
            pessoaDb.InscricaoEstadual = dto.InscricaoEstadual;
            pessoaDb.Cpf = dto.Cpf;
            pessoaDb.Rg = dto.Rg;
            pessoaDb.DataNascimento = dto.DataNascimento;
            pessoaDb.UsuarioId = userId;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao editar pessoa {PessoaId}", id);
                return StatusCode(
                    500,
                    new { success = false, message = "Ocorreu um erro interno ao editar a pessoa." }
                );
            }
        }

        // DELETE: api/Pessoas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePessoa(int id)
        {
            var userId = GetUserId();
            var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (pessoa == null)
            {
                return NotFound(new { success = false, message = "Pessoa não encontrada." });
            }

            bool temLancamentos = await _context.Lancamentos.AnyAsync(l => l.PessoaId == id);
            if (temLancamentos)
            {
                return BadRequest(
                    new
                    {
                        success = false,
                        message = "Não é possível excluir pessoa com lançamentos vinculados.",
                    }
                );
            }

            try
            {
                _context.Pessoas.Remove(pessoa);
                await _context.SaveChangesAsync();
                return NoContent(); // Sucesso
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir pessoa {PessoaId}", id);
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message = "Ocorreu um erro interno ao excluir a pessoa.",
                    }
                );
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
