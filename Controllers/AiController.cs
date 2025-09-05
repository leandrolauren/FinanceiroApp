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
            var response = await geminiService.GenerateContentAsync(
                request.Message,
                request.History
            );
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
}
