using System.Security.Claims;
using System.Text.Json;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Helpers;
using FinanceiroApp.Models;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

namespace FinanceiroApp.Controllers;

[Authorize]
[ApiController]
[Route("api/relatorios")]
public class RelatoriosController : ControllerBase
{
    private readonly IRelatorioAppService _relatorioAppService;
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<RelatoriosController> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IHttpClientFactory _httpClientFactory;

    public RelatoriosController(
        IRelatorioAppService relatorioAppService,
        ApplicationDbContext context,
        IEmailService emailService,
        ILogger<RelatoriosController> logger,
        IWebHostEnvironment webHostEnvironment,
        IHttpClientFactory httpClientFactory
    )
    {
        _relatorioAppService = relatorioAppService;
        _context = context;
        _emailService = emailService;
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("resumo-financeiro")]
    public async Task<IActionResult> SolicitarResumoFinanceiro(
        [FromBody] GerarRelatorioRequestDto dto
    )
    {
        var userId = GetUserId();
        var relatorio = await _relatorioAppService.SolicitarResumoFinanceiroAsync(dto, userId);
        return Accepted(
            new
            {
                message = "Sua solicitação de relatório foi recebida e está sendo processada.",
                relatorioId = relatorio.Id,
            }
        );
    }

    [HttpPost("extrato-categoria")]
    public async Task<IActionResult> SolicitarExtratoCategoria(
        [FromBody] GerarExtratoCategoriaRequestDto dto
    )
    {
        var userId = GetUserId();
        var relatorio = await _relatorioAppService.SolicitarExtratoCategoriaAsync(dto, userId);
        return Accepted(
            new
            {
                message = "Sua solicitação de extrato foi recebida e está sendo processada.",
                relatorioId = relatorio.Id,
            }
        );
    }

    [HttpGet]
    public async Task<IActionResult> ListarRelatorios([FromQuery] PaginationParams queryParams)
    {
        var userId = GetUserId();
        var query = _context
            .RelatoriosGerados.Where(r => r.UsuarioId == userId)
            .OrderByDescending(r => r.DataSolicitacao)
            .AsNoTracking();

        var pagedRelatorios = await PagedList<RelatorioGeradoModel>.CreateAsync(
            query,
            queryParams.PageNumber,
            queryParams.PageSize
        );

        Response.AddPaginationHeader(pagedRelatorios.GetPaginationHeader());

        var relatoriosDto = pagedRelatorios
            .Select(r => new RelatorioGeradoDto
            {
                Id = r.Id,
                TipoRelatorio = r.TipoRelatorio,
                Parametros = r.Parametros,
                Status = r.Status.ToString(),
                DataSolicitacao = r.DataSolicitacao,
                DataConclusao = r.DataConclusao,
            })
            .ToList();

        return Ok(relatoriosDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterRelatorio(Guid id)
    {
        var userId = GetUserId();
        var relatorio = await _context
            .RelatoriosGerados.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId);

        if (relatorio == null)
            return NotFound();

        if (relatorio.Status != Models.StatusRelatorio.Concluido)
        {
            return Ok(
                new
                {
                    relatorio.Id,
                    Status = relatorio.Status.ToString(),
                    Message = "O relatório ainda está sendo processado.",
                }
            );
        }

        return Ok(relatorio);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> BaixarRelatorioPdf(Guid id)
    {
        var userId = GetUserId();
        var relatorio = await _context
            .RelatoriosGerados.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId);

        if (
            relatorio == null
            || relatorio.Status != StatusRelatorio.Concluido
            || string.IsNullOrEmpty(relatorio.Resultado)
        )
        {
            return NotFound(new { message = "Relatório concluído não encontrado." });
        }

        try
        {
            var dados = JsonSerializer.Deserialize<RelatorioFinanceiroDados>(relatorio.Resultado);
            var logoData = await GetLogoBytesAsync();
            var document = new RelatorioDocument(dados, logoData);
            var pdfBytes = document.GeneratePdf();
            var nomeArquivo =
                $"Relatorio_Financeiro_{dados.DataInicio:yyyy-MM-dd}_a_{dados.DataFim:yyyy-MM-dd}.pdf";

            return File(pdfBytes, "application/pdf", nomeArquivo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar PDF para o relatório {RelatorioId}", id);
            return StatusCode(500, new { message = "Erro ao gerar o PDF do relatório." });
        }
    }

    [HttpPost("{id}/enviar-email")]
    public async Task<IActionResult> EnviarRelatorioPorEmail(
        Guid id,
        [FromBody] EnviarEmailRequestDto request
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        var relatorio = await _context
            .RelatoriosGerados.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId);

        if (
            relatorio == null
            || relatorio.Status != StatusRelatorio.Concluido
            || string.IsNullOrEmpty(relatorio.Resultado)
        )
        {
            return NotFound(new { message = "Relatório concluído não encontrado." });
        }

        try
        {
            var dados = JsonSerializer.Deserialize<RelatorioFinanceiroDados>(relatorio.Resultado);
            var logoData = await GetLogoBytesAsync();
            var document = new RelatorioDocument(dados, logoData);
            var pdfBytes = document.GeneratePdf();

            var nomeArquivo =
                $"Relatorio_Financeiro_{dados.DataInicio:yyyy-MM-dd}_a_{dados.DataFim:yyyy-MM-dd}.pdf";

            await _emailService.EnviarEmailRelatorioAsync(
                request.Email,
                dados,
                pdfBytes,
                nomeArquivo
            );

            return Ok(new { message = $"Relatório enviado com sucesso para {request.Email}." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar e-mail com o relatório {RelatorioId}", id);
            return StatusCode(500, new { message = "Erro ao enviar o e-mail com o relatório." });
        }
    }

    private async Task<byte[]> GetLogoBytesAsync()
    {
        const string logoUrl = "https://i.imgur.com/42QmCee.png";
        using var httpClient = _httpClientFactory.CreateClient();
        return await httpClient.GetByteArrayAsync(logoUrl);
    }

    private int GetUserId()
    {
        var claim =
            User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Usuário não autenticado.");
        return int.Parse(claim.Value);
    }
}
