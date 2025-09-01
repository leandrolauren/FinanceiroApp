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
    [Route("api/")]
    public class ContasApiController(
        ApplicationDbContext context,
        ILogger<ContasApiController> logger
    ) : ControllerBase
    {
        // GET: api/Contas
        [HttpGet("contas")]
        public async Task<ResponseModel<List<ListaContaDto>>> GetContas()
        {
            ResponseModel<List<ListaContaDto>> resposta = new();
            try
            {
                var userId = GetUserId();
                var contas = await context
                    .ContasBancarias.Where(c => c.UsuarioId == userId)
                    .AsNoTracking()
                    .ToListAsync();

                var resultado = contas
                    .Select(c => new ListaContaDto
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

                resposta.Data = resultado;
                resposta.Message = "Contas listadas com sucesso.";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao listar contas.");
                resposta.Message = "Erro ao listar contas.";
                resposta.Success = false;
                resposta.StatusCode = 500;
                resposta.Errors.AddRange(ex.Message);
            }
            return resposta;
        }

        // GET: api/Contas/{id}
        [HttpGet("contas/{id}")]
        public async Task<ResponseModel<ListaContaDto>> GetContaPorId(int id)
        {
            ResponseModel<ListaContaDto> resposta = new();
            try
            {
                var userId = GetUserId();
                var conta = await context
                    .ContasBancarias.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == userId);

                if (conta == null)
                {
                    resposta.Message = "Conta não encontrada.";
                    resposta.Success = false;
                    resposta.StatusCode = 404;
                    return resposta;
                }

                resposta.Data = new ListaContaDto
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
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao obter conta com o ID {id}.", id);
                resposta.Message = "Erro ao obter conta.";
                resposta.Success = false;
                resposta.StatusCode = 500;
                resposta.Errors.AddRange(ex.Message);
            }
            return resposta;
        }

        // POST: api/Contas
        [HttpPost("contas")]
        public async Task<ResponseModel<string>> CreateConta([FromBody] CreateContaDto dto)
        {
            ResponseModel<string> resposta = new();
            if (!ModelState.IsValid)
            {
                resposta.Success = false;
                resposta.Message = "Dados inválidos.";
                resposta.StatusCode = 400;
                resposta.Errors.AddRange("Dados inválidos.");
                return resposta;
            }

            try
            {
                var userId = GetUserId();
                var contaBancaria = new ContaBancaria
                {
                    Descricao = dto.Descricao,
                    NumeroConta = dto.NumeroConta,
                    Agencia = dto.Agencia,
                    DigitoAgencia = dto.DigitoAgencia,
                    DigitoConta = dto.DigitoConta,
                    Tipo = dto.Tipo,
                    Banco = dto.Banco,
                    UsuarioId = userId,
                };
                context.ContasBancarias.Add(contaBancaria);
                await context.SaveChangesAsync();
                resposta.Data = contaBancaria.Id.ToString();
                resposta.Message = "Conta cadastrada com sucesso.";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao criar conta bancária.");
                resposta.Message = "Erro ao criar conta";
                resposta.Success = false;
                resposta.StatusCode = 500;
                resposta.Errors.Add(ex.Message);
            }
            return resposta;
        }

        // PUT: api/Contas/{id}
        [HttpPut("contas/{id}")]
        public async Task<ResponseModel<string>> EditConta(int id, [FromBody] EditContaDto dto)
        {
            ResponseModel<string> resposta = new();
            if (!ModelState.IsValid)
            {
                resposta.Success = false;
                resposta.Message = "Dados inválidos.";
                resposta.StatusCode = 400;
                return resposta;
            }

            try
            {
                var userId = GetUserId();
                var contaExistente = await context.ContasBancarias.FirstOrDefaultAsync(c =>
                    c.Id == id && c.UsuarioId == userId
                );

                if (contaExistente == null)
                {
                    resposta.Success = false;
                    resposta.Message = "Conta não encontrada.";
                    resposta.StatusCode = 404;
                    return resposta;
                }

                contaExistente.Descricao = dto.Descricao;
                contaExistente.Banco = dto.Banco;
                contaExistente.Tipo = dto.Tipo;
                contaExistente.NumeroConta = dto.NumeroConta;
                contaExistente.DigitoAgencia = dto.DigitoAgencia;
                contaExistente.DigitoConta = dto.DigitoConta;
                contaExistente.Agencia = dto.Agencia;
                contaExistente.Ativa = dto.Ativa;

                context.ContasBancarias.Update(contaExistente);
                await context.SaveChangesAsync();

                resposta.Message = "Conta editada com sucesso.";
                resposta.Data = contaExistente.Id.ToString();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao editar conta {ContaId}", id);
                resposta.Message = "Erro ao editar conta";
                resposta.Success = false;
                resposta.Errors.Add(ex.Message);
            }
            return resposta;
        }

        // DELETE: api/Contas/{id}
        [HttpDelete("contas/{id}")]
        public async Task<ResponseModel<string>> DeleteConta(int id)
        {
            ResponseModel<string> resposta = new();
            var userId = GetUserId();
            var conta = await context.ContasBancarias.FirstOrDefaultAsync(c =>
                c.Id == id && c.UsuarioId == userId
            );

            if (conta == null)
            {
                resposta.Success = false;
                resposta.StatusCode = 404;
                resposta.Message = $"Conta com ID {id} não encontrada.";
                return resposta;
            }

            bool temLancamentos = await context.Lancamentos.AnyAsync(l => l.ContaBancariaId == id);
            if (temLancamentos)
            {
                resposta.Success = false;
                resposta.StatusCode = 404;
                resposta.Message = "Conta possui lançamentos vinculados e não pode ser excluída.";
                return resposta;
            }

            try
            {
                context.ContasBancarias.Remove(conta);
                await context.SaveChangesAsync();
                resposta.Data = id.ToString();
                resposta.Message = "Conta excluída com sucesso!";
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao excluir conta {ContaId}", id);
                resposta.Message = "Erro ao excluir conta";
                resposta.Success = false;
                resposta.StatusCode = 500;
                resposta.Errors.Add(ex.Message);
            }
            return resposta;
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
