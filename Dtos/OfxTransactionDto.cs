namespace FinanceiroApp.Dtos
{
    public class OfxTransactionDto
    {
        public string FitId { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsImported { get; set; }
        public int? PlanoContasId { get; set; }
    }
}
