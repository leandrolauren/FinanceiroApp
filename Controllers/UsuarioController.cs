using System;
using System.Security.Cryptography;
using System.Text;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class UsuarioController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IRabbitMqService _rabbitMqService;

    public UsuarioController(ApplicationDbContext context, IRabbitMqService rabbitMqService)
    {
        _context = context;
        _rabbitMqService = rabbitMqService;
    }
        // GET: Usuario/Create
    public IActionResult Create() => View();

    // POST: Usuario/Create
    [HttpPost]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Create([FromBody] UsuarioCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            Console.WriteLine(model.Nome, model.Email, model.Senha);
            var errors = ModelState
                .Values.SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            ViewBag.NotificacaoAlerta = "Preencha os campos corretamente!";
            return BadRequest(
                new
                {
                    success = false,
                    message = "Por favor, preencha todos os campos corretamente.",
                    errors,
                }
            );
        }
        var usuarioExistente = await _context
            .Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == model.Email);
        if (usuarioExistente != null)
        {
            ViewBag.NotificacaoAlerta = "Ja existe um usuario com este email!";
            return BadRequest(
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

        Console.WriteLine($"Data criacao {usuarioPendente.DataCriacao}");

        _context.UsuariosPendentes.Add(usuarioPendente);
        await _context.SaveChangesAsync();

        ViewBag.NotificacaoAlerta = "Confira seu email para ativar o seu acesso.";

        // Publica no RabbitMQ
        var mensagem = new EmailConfirmacaoMessage
        {
            Email = usuarioPendente.Email,
            Token = usuarioPendente.Token,
        };

        _rabbitMqService.PublicarMensagem("email_confirmacao_queue", mensagem);

        ViewBag.NotificacaoAlerta = "Usuário pendente de confirmação, verifique seu e-mail!";

        return RedirectToAction("Index", "Home");
    }

    // GET: Usuario/Confirmar?token=
    [HttpGet]
    public async Task<IActionResult> Confirmar(string token)
    {
        if (string.IsNullOrEmpty(token))
            return BadRequest(
                new { success = false, message = "Token ou parâmetro de confirmação ausente." }
            );

        var pendente = await _context.UsuariosPendentes.FirstOrDefaultAsync(u => u.Token == token);

        if (pendente == null)
            return NotFound(new { success = false, message = "Usuário pendente não encontrado." });

        if (DateTime.Now > pendente.DataCriacao.AddMinutes(20))
        {
            _context.UsuariosPendentes.Remove(pendente);
            await _context.SaveChangesAsync();
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

            _context.Usuarios.Add(usuario);
            _context.UsuariosPendentes.Remove(pendente);
            await _context.SaveChangesAsync();

            var mensagem = new EmailConfirmacaoMessage { Email = usuario.Email };

            _rabbitMqService.PublicarMensagem("email_confirmacao_queue", mensagem);

            ViewBag.NotificacaoSucesso = "Usuário cadastrado!";
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            ModelState.AddModelError("", $"Erro ao cadastrar usuário: {ex.Message}");
        }

        return View();
    }

    private string GerarHash(string senha) => BCrypt.Net.BCrypt.HashPassword(senha);
}
