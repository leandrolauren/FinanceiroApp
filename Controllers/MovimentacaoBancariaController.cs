using System.Security.Claims;
using FinanceiroApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers;

[Authorize]
[ApiController]
[Route("api/")]
public class MovimentacaoBancariaController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet("contas/{contaId:int}/extrato")]
    public async Task<IActionResult> GetExtratoConta(int contaId)
    {
        try
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var contaExiste = await context.ContasBancarias.AnyAsync(c =>
                c.Id == contaId && c.UsuarioId == usuarioId
            );

            if (!contaExiste)
            {
                return Forbid("Acesso negado a esta conta bancária.");
            }

            var movimentacoes = await context
                .MovimentacoesBancarias.Where(m => m.ContaBancariaId == contaId)
                .OrderByDescending(m => m.DataMovimentacao)
                .ThenByDescending(m => m.Id)
                .Select(m => new
                {
                    m.Id,
                    m.DataMovimentacao,
                    m.Historico,
                    Tipo = m.TipoMovimentacao.ToString(),
                    Valor = m.TipoMovimentacao == Models.TipoMovimentacao.Entrada
                        ? m.Valor
                        : -m.Valor,
                    m.LancamentoId,
                })
                .ToListAsync();

            return Ok(movimentacoes);
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new { message = "Erro ao buscar extrato da conta.", error = ex.Message }
            );
        }
    }
}
