namespace FinanceiroApp.Models;

public class LancamentoViewModel
{
    public TipoLancamento Tipo { get; set; }
    public decimal Valor { get; set; }
    public string? Descricao { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime DataCompetencia { get; set; }
    public int ContaBancariaId { get; set; }
    public int PlanoContaId { get; set; }
    public int PessoaId { get; set; }
    public int UsuarioId { get; set; }
    public int? LancamentoPaiId { get; set; }
    public bool Pago { get; set; }
    public DateTime? DataPagamento { get; set; }
}
