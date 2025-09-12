namespace FinanceiroApp.Dtos;

public class ExtratoCategoriaDados
{
    public string NomeUsuario { get; set; } = string.Empty;
    public string NomeCategoria { get; set; } = string.Empty;
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string StatusFiltro { get; set; } = string.Empty;
    public decimal TotalCategoria { get; set; }
    public List<LancamentoRelatorioDto> Lancamentos { get; set; } = new();
}