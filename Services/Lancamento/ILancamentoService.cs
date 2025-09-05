using FinanceiroApp.Dtos;
using FinanceiroApp.Models;

namespace FinanceiroApp.Services
{
    public interface ILancamentoService
    {
        Task<LancamentoModel> CreateLancamentoAsync(CriarLancamentoDto dto, int userId);
    }
}
