using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services;

public interface IRelatorioFinanceiroService
{
    Task<RelatorioFinanceiroDados> GerarDadosRelatorioAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        string status
    );

    Task<ExtratoCategoriaDados> GerarDadosExtratoCategoriaAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        int planoContaId,
        string status
    );

    Task<byte[]> GerarRelatorioPdfAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        string status
    );
}
