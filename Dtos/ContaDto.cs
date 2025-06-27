public class ContaDto
{
    public int Id { get; set; }
    public string? Descricao { get; set; }
    public string? NumeroConta { get; set; }
    public string? Agencia { get; set; }
    public string? DigitoAgencia { get; set; }
    public string? DigitoConta { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
    public bool Ativa { get; set; }
    public string? Banco { get; set; }
    public int UsuarioId { get; set; }
}
