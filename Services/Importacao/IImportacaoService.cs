using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services
{
    public interface IImportacaoService
    {
        Task<IEnumerable<OfxTransactionDto>> ParseFile(
            IFormFile file,
            string fileType,
            int contaBancariaId,
            System.DateTime dataInicio,
            System.DateTime dataFim
        );

        Task<int> ImportTransactions(ImportOfxRequestDto request, int userId);
    }
}
