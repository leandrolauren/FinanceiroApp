using System.Security.Cryptography;
using System.Text;
using FinanceiroApp.Data;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Mvc;

public class UsuarioController : Controller
{
    private readonly ApplicationDbContext _context;

    public UsuarioController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: Usuario/Create
    public IActionResult Create() => View();

    // POST: Usuario/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(UsuarioCreateViewModel model)
    {
        if (ModelState.IsValid)
        {
            var usuario = new UsuarioModel
            {
                Nome = model.Nome,
                Email = model.Email,
                SenhaHash = GerarHash(model.Senha),
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            TempData["MensagemSucesso"] = "Usuário cadastrado!";
            return RedirectToAction("Index", "Home");
        }

        return View(model);
    }

    private string GerarHash(string senha) => BCrypt.Net.BCrypt.HashPassword(senha);
}
