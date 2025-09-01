using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class UsuarioController(
    ApplicationDbContext context,
    IRabbitMqService rabbitMqService,
    ILogger<UsuarioController> logger
) : Controller
{
    // GET: Usuario/Create
    public IActionResult Create() => View();

    // POST: Usuario/Create
    [HttpPost]
    [IgnoreAntiforgeryToken]
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
                    message = "Por favor, preencha todos os campos corretamente.",
                    errors,
                }
            );
        }

        var usuarioExistente = await context
            .Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (usuarioExistente != null)
            return BadRequest(
                new { success = false, message = "Já existe um usuário com este email." }
            );

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

        // Publica no RabbitMQ
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

    // GET: Usuario/Confirmar?token=
    [HttpGet]
    public async Task<IActionResult> Confirmar(string token)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest(new { success = false, message = "Token de confirmação ausente." });

        var pendente = await context.UsuariosPendentes.FirstOrDefaultAsync(u => u.Token == token);

        if (pendente == null)
            return NotFound(new { success = false, message = "Usuário pendente não encontrado." });

        if (DateTime.Now > pendente.DataCriacao.AddMinutes(1440)) // 24h
        {
            context.UsuariosPendentes.Remove(pendente);
            await context.SaveChangesAsync();
            return BadRequest(new { sucess = false, message = "Tempo de confirmação expirado." });
        }

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
                "email_confirmacao_queue",
                new EmailConfirmacaoMessage { Email = usuario.Email }
            );

            ViewBag.NotificacaoSucesso = "Usuário cadastrado!";
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao confirmar cadastro de usuário.");
            ModelState.AddModelError("", $"Erro ao cadastrar usuário: {ex.Message}");
        }

        return View();
    }

    private string GerarHash(string senha) => BCrypt.Net.BCrypt.HashPassword(senha);
}
