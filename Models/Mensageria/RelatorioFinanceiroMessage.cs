namespace FinanceiroApp.Models;

public class RelatorioFinanceiroMessage
{
    public Guid RelatorioId { get; set; }
    public int UsuarioId { get; set; }
    public string EmailDestino { get; set; } = string.Empty;
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = string.Empty;
}
