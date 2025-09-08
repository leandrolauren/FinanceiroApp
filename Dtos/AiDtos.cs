namespace FinanceiroApp.Dtos
{
    public class AiCategorizeRequestDto
    {
        public List<OfxTransactionDto> Transactions { get; set; } = new();
    }

    public class AiCategorizedTransactionDto
    {
        public string FitId { get; set; }
        public int? PlanoContasId { get; set; }
    }
}
