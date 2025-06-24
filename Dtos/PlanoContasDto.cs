namespace FinanceiroApp.Dtos
{
    public class PlanoContasDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public string Tipo { get; set; }
        public int? PlanoContasPaiId { get; set; }
        public decimal Total { get; set; }
        public List<PlanoContasDto> Filhos { get; set; } = new();
    }
}
