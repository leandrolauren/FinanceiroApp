using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class ContaBancaria
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Informe a descrição.")]
    public required string Descricao { get; set; }
    public string? NumeroConta { get; set; }
    public string? Agencia { get; set; }
    public string? DigitoAgencia { get; set; }
    public string? DigitoConta { get; set; }

    [Required(ErrorMessage = "Informe o tipo da conta.")]
    public TipoConta Tipo { get; set; }
    public decimal Saldo { get; set; }
    public bool? Ativa { get; set; }
    public string? Banco { get; set; }
    public int UsuarioId { get; set; }
    public UsuarioModel? Usuario { get; set; }
}

public enum TipoConta
{
    Corrente = 1,
    Poupanca = 2,
    Salario = 3,
    Investimento = 4,
}
