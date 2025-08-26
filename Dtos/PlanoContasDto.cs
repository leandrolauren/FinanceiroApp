namespace FinanceiroApp.Dtos
{
    public class PlanoContasDto
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public string? Tipo { get; set; }
        public int? PlanoContasPaiId { get; set; }
        public decimal Total { get; set; }
        public List<PlanoContasDto> Filhos { get; set; } = new();
    }

    public class PlanoContaComTotalDto
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public string? Tipo { get; set; }
        public bool Padrao { get; set; }
        public decimal TotalReceitas { get; set; }
        public decimal TotalDespesas { get; set; }
    }

    public class EditPlanoContaDto
    {
        public required string Descricao { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }

    public class PlanoContaCriadoDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public string Tipo { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }

    public class CriarPlanoContaDto
    {
        public required string Descricao { get; set; }
        public required string Tipo { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }
}
