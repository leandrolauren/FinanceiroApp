using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[AllowAnonymous]
public class UsuarioController(
    ApplicationDbContext context,
    IRabbitMqService rabbitMqService,
    ILogger<UsuarioController> logger
) : Controller
{
    // GET: Usuario/Create
    [HttpGet]
    public IActionResult Create() => View();

    // POST: Usuario/Create
    // Endpoint da API chamado pelo FormRegister.jsx
    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> Create([FromBody] UsuarioCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Values.SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(
                new
                {
                    success = false,
                    message = "Dados inválidos.",
                    errors,
                }
            );
        }
        try
        {
            var usuarioExistente = await context
                .Usuarios.AsNoTracking()
                .AnyAsync(u => u.Email == model.Email);
            if (usuarioExistente)
            {
                return Conflict(
                    new { success = false, message = "Já existe um usuário com este email." }
                );
            }

            var token = Guid.NewGuid().ToString();
            var usuarioPendente = new UsuarioPendenteModel
            {
                Id = Guid.NewGuid(),
                Nome = model.Nome,
                Email = model.Email,
                SenhaHash = GerarHash(model.Senha),
                Token = token,
                DataCriacao = DateTime.Now,
            };

            context.UsuariosPendentes.Add(usuarioPendente);
            await context.SaveChangesAsync();

            rabbitMqService.PublicarMensagem(
                "email_confirmacao_queue",
                new EmailConfirmacaoMessage
                {
                    Email = usuarioPendente.Email,
                    Token = usuarioPendente.Token,
                }
            );

            return Ok(
                new
                {
                    success = true,
                    message = "Usuário criado com sucesso. Verifique seu e-mail para ativar a conta!",
                }
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao criar usuário pendente para o email {Email}", model.Email);
            return StatusCode(
                500,
                new
                {
                    success = false,
                    message = "Ocorreu um erro inesperado ao tentar criar o usuário.",
                }
            );
        }
    }

    // GET: /Usuario/Confirmar/{token}
    [HttpGet("Usuario/Confirmar")]
    public async Task<IActionResult> Confirmar([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            TempData["ErrorMessage"] = "Token de confirmação inválido.";
            return RedirectToAction("Index", "Login");
        }

        var pendente = await context.UsuariosPendentes.FirstOrDefaultAsync(u => u.Token == token);

        if (pendente == null)
        {
            TempData["ErrorMessage"] = "Usuário pendente não encontrado ou token inválido.";
            return RedirectToAction("Index", "Login");
        }

        if (DateTime.Now > pendente.DataCriacao.AddHours(24))
        {
            context.UsuariosPendentes.Remove(pendente);
            await context.SaveChangesAsync();
            TempData["ErrorMessage"] =
                "Tempo de confirmação expirado. Por favor, cadastre-se novamente.";
            return RedirectToAction("Index", "Login");
        }

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var usuario = new UsuarioModel
            {
                Nome = pendente.Nome,
                Email = pendente.Email,
                SenhaHash = pendente.SenhaHash,
            };
            context.Usuarios.Add(usuario);
            context.UsuariosPendentes.Remove(pendente);
            await context.SaveChangesAsync();

            rabbitMqService.PublicarMensagem(
                "email_sucesso_queue",
                new EmailConfirmacaoMessage { Email = usuario.Email }
            );

            await transaction.CommitAsync();

            TempData["SuccessMessage"] =
                "Seu cadastro foi confirmado com sucesso! Você já pode fazer o login.";
            return RedirectToAction("Index", "Login");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Erro ao confirmar cadastro de usuário com token {Token}.", token);
            TempData["ErrorMessage"] =
                "Ocorreu um erro interno ao confirmar seu cadastro. Tente novamente mais tarde.";
            return RedirectToAction("Index", "Login");
        }
    }

    private string GerarHash(string senha) => BCrypt.Net.BCrypt.HashPassword(senha);
}
