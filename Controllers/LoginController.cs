using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Route("[controller]")]
[ApiController]
public class LoginController(
    ApplicationDbContext context,
    IConfiguration configuration,
    ILogger<LoginController> logger
) : Controller
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Index()
    {
        ViewData["GoogleClientId"] = configuration["Google:ClientId"];
        return View();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginViewModel model)
    {
        var user = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(model.Senha, user.SenhaHash))
            return Unauthorized(new { success = false, message = "Credenciais inválidas." });

        await AutenticarUsuario(user, 2); // expira em 2h
        return Ok(new { success = true, message = "Login realizado com sucesso." });
    }

    [HttpPost("GoogleSignIn")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleSignInRequest request)
    {
        logger.LogInformation("Recebida tentativa de login com Google.");

        try
        {
            var googleClientId = configuration["Google:ClientId"];
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [googleClientId],
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

            var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (usuario == null)
            {
                usuario = new UsuarioModel
                {
                    Nome = payload.Name,
                    Email = payload.Email,
                    SenhaHash = "",
                };
                context.Usuarios.Add(usuario);
                await context.SaveChangesAsync();
                logger.LogInformation("Novo usuário criado via Google: {Email}", usuario.Email);
            }

            await AutenticarUsuario(usuario, 48);
            return Ok(new { success = true, message = "Login via Google realizado com sucesso." });
        }
        catch (InvalidJwtException e)
        {
            logger.LogWarning(e, "Token Google inválido.");
            return Unauthorized(new { success = false, message = "Token do Google inválido." });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Erro inesperado no Google Sign-In.");
            return StatusCode(500, new { success = false, message = "Erro interno no servidor." });
        }
    }

    [HttpPost("Logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (Request.Headers["Accept"].ToString().Contains("application/json"))
            return Ok(new { success = true, message = "Logout realizado com sucesso." });

        return RedirectToAction(nameof(Index));
    }
    private async Task AutenticarUsuario(UsuarioModel usuario, int expiraHoras)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
        };

        var claimsIdentity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(expiraHoras),
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties
        );
    }
}

public class GoogleSignInRequest
{
    public required string IdToken { get; set; }
}
