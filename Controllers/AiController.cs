using FinanceiroApp.Dtos;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceiroApp.Controllers;

[Authorize]
[ApiController]
[Route("api/ai")]
public class AiController(IGeminiService geminiService, ILogger<AiController> logger)
    : ControllerBase
{
    [HttpPost("chat")]
    public async Task<IActionResult> PostChatMessage([FromBody] ChatRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "A mensagem não pode estar vazia." });

        try
        {
            var response = await geminiService.GenerateContentAsync(request.Message);
            return Ok(new ChatResponseDto { Response = response });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao comunicar com a API de IA.");
            return StatusCode(
                500,
                new
                {
                    message = "Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde.",
                }
            );
        }
    }

    [HttpPost("categorize")]
    public async Task<IActionResult> CategorizeTransactions(
        [FromBody] AiCategorizeRequestDto request
    )
    {
        if (request.Transactions == null || request.Transactions.Count == 0)
            return BadRequest(new { message = "Nenhuma transação enviada para categorização." });

        try
        {
            var result = await geminiService.CategorizeTransactionsAsync(request.Transactions);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao categorizar transações com a IA.");
            return StatusCode(
                500,
                new { message = "Desculpe, não consegui categorizar as transações no momento." }
            );
        }
    }
}
