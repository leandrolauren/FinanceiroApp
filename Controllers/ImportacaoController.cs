using System.Security.Claims;
using FinanceiroApp.Dtos;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceiroApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/importacao")]
    public class ImportacaoController : ControllerBase
    {
        private readonly IImportacaoService _importacaoService;

        public ImportacaoController(IImportacaoService importacaoService)
        {
            _importacaoService = importacaoService;
        }

        [HttpPost("parse")]
        public async Task<IActionResult> ParseFile([FromForm] ParseFileRequestDto request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("Nenhum arquivo enviado.");

            var fileExtension = Path.GetExtension(request.File.FileName);
            if (!string.Equals(fileExtension, ".ofx", StringComparison.OrdinalIgnoreCase))
                return BadRequest(
                    "Formato de arquivo inválido. Por favor, envie somente arquivos com a extensão .ofx."
                );

            try
            {
                var transactions = await _importacaoService.ParseFile(
                    request.File,
                    request.FileType,
                    request.ContaBancariaId,
                    request.DataInicio,
                    request.DataFim
                );
                return Ok(transactions);
            }
            catch (NotSupportedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao processar o arquivo: {ex.Message}");
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportTransactions([FromBody] ImportOfxRequestDto request)
        {
            if (request == null || request.Transactions == null || !request.Transactions.Any())
                return BadRequest("Nenhuma transação para importar.");

            try
            {
                var userId = GetUserId();
                var importedCount = await _importacaoService.ImportTransactions(request, userId);

                if (importedCount == 0)
                {
                    return Ok(
                        new
                        {
                            Message = "Nenhuma nova transação foi importada. As selecionadas podem já existir no sistema.",
                        }
                    );
                }

                return Ok(new { Message = $"{importedCount} transações importadas com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao importar transações: {ex.Message}");
            }
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out var userId))
                throw new UnauthorizedAccessException("Usuário não autenticado.");
            return userId;
        }
    }
}
