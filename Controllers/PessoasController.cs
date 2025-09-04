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
    [Route("api/")]
    public class PessoasApiController(
        ApplicationDbContext context,
        ILogger<PessoasController> logger
    ) : ControllerBase
    {
        // GET: /api/Pessoas
        [HttpGet("pessoas")]
        public async Task<IActionResult> GetPessoas()
        {
            var userId = GetUserId();
            var pessoas = await context
                .Pessoas.Where(p => p.UsuarioId == userId)
                .AsNoTracking()
                .ToListAsync();
            return Ok(pessoas);
        }

        // GET: api/Pessoas/{id}
        [HttpGet("pessoas/{id}")]
        public async Task<IActionResult> GetPessoa(int id)
        {
            var userId = GetUserId();
            var pessoa = await context
                .Pessoas.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

            if (pessoa == null)
            {
                return NotFound(new { success = false, message = "Pessoa não encontrada." });
            }
            return Ok(pessoa);
        }

        // POST: api/Pessoas
        [HttpPost("pessoas")]
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
                    NomeFantasia = dto.NomeFantasia,
                    Cnpj = dto.Cnpj,
                    Tipo = dto.Tipo,
                    Email = dto.Email,
                    Telefone = dto.Telefone,
                    Endereco = dto.Endereco,
                    Cep = dto.Cep,
                    Numero = dto.Numero,
                    Bairro = dto.Bairro,
                    Complemento = dto.Complemento,
                    Cidade = dto.Cidade,
                    Estado = dto.Estado,
                    InscricaoEstadual = dto.InscricaoEstadual,
                    Cpf = dto.Cpf,
                    Rg = dto.Rg,
                    DataNascimento = dto.DataNascimento,
                    UsuarioId = userId,
                };

                context.Pessoas.Add(pessoa);
                await context.SaveChangesAsync();

                return new { id = pessoa.Id };
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
                    return BadRequest(
                        new { success = false, message = "Este CPF ou CNPJ já está cadastrado" }
                    );
                logger.LogError(ex, "Erro de banco de dados ao criar pessoa.");
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message = "Ocorreu um erro de banco de dados ao criar a pessoa.",
                    }
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao criar pessoa.");
                return StatusCode(
                    500,
                    new { success = false, message = "Ocorreu um erro interno ao criar a pessoa." }
                );
            }
        }

        // PUT: api/Pessoas/{id}
        [HttpPut("pessoas/{id}")]
        public async Task<IActionResult> EditPessoa(int id, [FromBody] EditPessoaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var pessoaDb = await context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (pessoaDb == null)
                return NotFound(new { success = false, message = "Pessoa não encontrada." });

            pessoaDb.Nome = dto.Nome;
            pessoaDb.RazaoSocial = dto.RazaoSocial;
            pessoaDb.Email = dto.Email;
            pessoaDb.Telefone = dto.Telefone;
            pessoaDb.Endereco = dto.Endereco;
            pessoaDb.Cep = dto.Cep;
            pessoaDb.Numero = dto.Numero;
            pessoaDb.Bairro = dto.Bairro;
            pessoaDb.Complemento = dto.Complemento;
            pessoaDb.Cidade = dto.Cidade;
            pessoaDb.Estado = dto.Estado;
            pessoaDb.NomeFantasia = dto.NomeFantasia;
            pessoaDb.InscricaoEstadual = dto.InscricaoEstadual;
            pessoaDb.Cpf = dto.Cpf;
            pessoaDb.Cnpj = dto.Cnpj;
            pessoaDb.Rg = dto.Rg;
            pessoaDb.DataNascimento = dto.DataNascimento;

            try
            {
                await context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (
                    ex.InnerException is Npgsql.PostgresException postgresEx
                    && postgresEx.SqlState == "23505"
                )
                {
                    return BadRequest(
                        new { success = false, message = "Este CPF ou CNPJ já está cadastrado." }
                    );
                }

                logger.LogError(ex, "Erro de banco de dados ao editar pessoa {PessoaId}", id);
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message = "Ocorreu um erro de banco de dados ao editar a pessoa.",
                    }
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao editar pessoa {PessoaId}", id);
                return StatusCode(
                    500,
                    new { success = false, message = "Ocorreu um erro interno ao editar a pessoa." }
                );
            }
        }

        // DELETE: api/Pessoas/{id}
        [HttpDelete("pessoas/{id}")]
        public async Task<IActionResult> DeletePessoa(int id)
        {
            var userId = GetUserId();
            var pessoa = await context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == id && p.UsuarioId == userId
            );

            if (pessoa == null)
            {
                return NotFound(new { success = false, message = "Pessoa não encontrada." });
            }

            bool temLancamentos = await context.Lancamentos.AnyAsync(l => l.PessoaId == id);
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
                context.Pessoas.Remove(pessoa);
                await context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao excluir pessoa {PessoaId}", id);
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
