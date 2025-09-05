using FinanceiroApp.Dtos;
using FinanceiroApp.Models;

namespace FinanceiroApp.Services
{
    public interface IPessoaService
    {
        Task<PessoaModel> CreatePessoaAsync(CriarPessoaDto dto, int userId);
        Task<PessoaModel?> UpdatePessoaAsync(int pessoaId, EditPessoaDto dto, int userId);
        Task<bool> DeletePessoaAsync(int pessoaId, int userId);
    }
}
