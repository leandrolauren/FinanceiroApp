using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateContentAsync(string userMessage, List<ChatMessageDto> history);
        Task<List<AiCategorizedTransactionDto>> CategorizeTransactionsAsync(List<OfxTransactionDto> transactions);
    }
}
