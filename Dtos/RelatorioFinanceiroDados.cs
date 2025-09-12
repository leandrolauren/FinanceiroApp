namespace FinanceiroApp.Dtos;

public class RelatorioFinanceiroDados
{
    public string NomeUsuario { get; set; } = string.Empty;
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string StatusFiltro { get; set; } = string.Empty;
    public KpiDto Kpis { get; set; } = new();
    public List<CategoriaTotalDto> TopDespesas { get; set; } = new();
    public List<CategoriaTotalDto> TopReceitas { get; set; } = new();
    public List<LancamentoRelatorioDto> Lancamentos { get; set; } = new();
    public List<SaldoContaBancariaDto> SaldosContas { get; set; } = new();
}
