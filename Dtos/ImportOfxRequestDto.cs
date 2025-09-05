using System.Text.Json.Serialization;

namespace FinanceiroApp.Dtos
{
    public class ImportOfxRequestDto
    {
        public int ContaBancariaId { get; set; }
        public int? PlanoContasReceitaId { get; set; }
        public int? PlanoContasDespesaId { get; set; }
        public int PessoaId { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime DataCompetencia { get; set; }

        [JsonIgnore]
        public List<OfxTransactionDto> Transactions { get; set; } = [];
    }
}
