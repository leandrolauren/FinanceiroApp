namespace FinanceiroApp.Dtos
{
    public class LancamentoQueryParams : PaginationParams
    {
        public string? Descricao { get; set; }
        public string? Tipo { get; set; }
        public bool? Pago { get; set; }
        public int? PessoaId { get; set; }
        public int? PlanoContasId { get; set; }
        public int? ContaBancariaId { get; set; }
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string? TipoData { get; set; }
        public string? SortColumn { get; set; }
        public string? SortDirection { get; set; } = "desc";
    }
}
