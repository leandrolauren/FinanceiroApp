using System.Text.Json;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;

namespace FinanceiroApp.Services;

public class RelatorioAppService : IRelatorioAppService
{
    private readonly ApplicationDbContext _context;
    private readonly IRabbitMqService _rabbitMqService;

    public RelatorioAppService(ApplicationDbContext context, IRabbitMqService rabbitMqService)
    {
        _context = context;
        _rabbitMqService = rabbitMqService;
    }

    public async Task<RelatorioGeradoModel> SolicitarResumoFinanceiroAsync(
        GerarRelatorioRequestDto dto,
        int userId
    )
    {
        var relatorio = new RelatorioGeradoModel
        {
            Id = Guid.NewGuid(),
            UsuarioId = userId,
            TipoRelatorio = "ResumoFinanceiro",
            Parametros = JsonSerializer.Serialize(dto),
            Status = StatusRelatorio.Processando,
            DataSolicitacao = DateTime.UtcNow,
        };

        _context.RelatoriosGerados.Add(relatorio);
        await _context.SaveChangesAsync();

        var mensagem = new RelatorioInterativoMessage
        {
            RelatorioId = relatorio.Id,
            UsuarioId = userId,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            Status = dto.Status,
        };
        _rabbitMqService.PublicarMensagem("relatorio_interativo_queue", mensagem);

        return relatorio;
    }

    public async Task<RelatorioGeradoModel> SolicitarExtratoCategoriaAsync(
        GerarExtratoCategoriaRequestDto dto,
        int userId
    )
    {
        var relatorio = new RelatorioGeradoModel
        {
            Id = Guid.NewGuid(),
            UsuarioId = userId,
            TipoRelatorio = "ExtratoCategoria",
            Parametros = JsonSerializer.Serialize(dto),
            Status = StatusRelatorio.Processando,
            DataSolicitacao = DateTime.UtcNow,
        };

        _context.RelatoriosGerados.Add(relatorio);
        await _context.SaveChangesAsync();

        var mensagem = new ExtratoCategoriaMessage
        {
            RelatorioId = relatorio.Id,
            UsuarioId = userId,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            PlanoContaId = dto.PlanoContaId,
            Status = dto.Status,
        };

        _rabbitMqService.PublicarMensagem("extrato_categoria_queue", mensagem);

        return relatorio;
    }
}
