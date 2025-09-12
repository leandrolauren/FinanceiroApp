namespace FinanceiroApp.Models;

public class RelatorioInterativoMessage
{
    public Guid RelatorioId { get; set; }
    public int UsuarioId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = string.Empty;
}
