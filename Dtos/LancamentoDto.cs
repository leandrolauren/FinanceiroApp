namespace FinanceiroApp.Dtos
{
    public class LancamentoDto
    {
        public int Id { get; set; }
        public required string Descricao { get; set; }
        public required string Tipo { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataCompetencia { get; set; }
        public DateTime? DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public DateTime DataLancamento { get; set; }
        public bool Pago { get; set; }
        public PessoaLancamentoDto? Pessoa { get; set; }
        public PlanoContasLancamentoDto? PlanoContas { get; set; }
        public ContaDto? ContaBancaria { get; set; }
    }

    public class PessoaLancamentoDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
    }

    public class PlanoContasLancamentoDto
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
    }

    public class LancamentoEditDto
    {
        public int Id { get; set; }
        public required string Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataCompetencia { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public bool Pago { get; set; }
        public int ContaBancariaId { get; set; }
        public int PlanoContasId { get; set; }
        public int PessoaId { get; set; }
    }

    public class LancamentoCreateDto
    {
        public required string Descricao { get; set; }
        public required string Tipo { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataCompetencia { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public bool Pago { get; set; }
        public int ContaBancariaId { get; set; }
        public int PlanoContasId { get; set; }
        public int PessoaId { get; set; }
    }
}
