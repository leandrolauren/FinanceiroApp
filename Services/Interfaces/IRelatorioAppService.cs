using FinanceiroApp.Dtos;
using FinanceiroApp.Models;

namespace FinanceiroApp.Services;

public interface IRelatorioAppService
{
    Task<RelatorioGeradoModel> SolicitarResumoFinanceiroAsync(
        GerarRelatorioRequestDto dto,
        int userId
    );
    Task<RelatorioGeradoModel> SolicitarExtratoCategoriaAsync(
        GerarExtratoCategoriaRequestDto dto,
        int userId
    );
}
