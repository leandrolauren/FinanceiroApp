using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services
{
    public interface IFileParser
    {
        Task<IEnumerable<OfxTransactionDto>> Parse(IFormFile file);
    }
}
