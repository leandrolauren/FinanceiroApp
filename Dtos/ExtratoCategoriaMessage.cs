namespace FinanceiroApp.Models;

public class ExtratoCategoriaMessage
{
    public Guid RelatorioId { get; set; }
    public int UsuarioId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public int PlanoContaId { get; set; }
    public string Status { get; set; } = string.Empty;
}