using System.ComponentModel.DataAnnotations;
using FinanceiroApp.Models;

namespace FinanceiroApp.Dtos
{
    public class CreateContaDto
    {
        [Required(ErrorMessage = "Informe a descrição.")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres.")]
        public required string Descricao { get; set; }
        public string? NumeroConta { get; set; }
        public string? Agencia { get; set; }
        public string? DigitoAgencia { get; set; }
        public string? DigitoConta { get; set; }

        [Required(ErrorMessage = "Informe o tipo da conta.")]
        public TipoConta Tipo { get; set; }
        public bool Ativa { get; set; }
        public string? Banco { get; set; }
        public int UsuarioId { get; set; }
    }

    public class ListaContaDto
    {
        public int Id { get; set; }
        public required string Descricao { get; set; }

        public string? NumeroConta { get; set; }
        public string? Agencia { get; set; }
        public string? DigitoAgencia { get; set; }
        public string? DigitoConta { get; set; }
        public TipoConta Tipo { get; set; }
        public decimal Saldo { get; set; }
        public bool Ativa { get; set; }
        public string? Banco { get; set; }
        public int UsuarioId { get; set; }
    }

    public class EditContaDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres.")]
        public string? Descricao { get; set; }

        public string? NumeroConta { get; set; }

        public string? Agencia { get; set; }
        public string? DigitoAgencia { get; set; }
        public string? DigitoConta { get; set; }

        [Required(ErrorMessage = "O tipo da conta é obrigatório.")]
        public TipoConta Tipo { get; set; }

        public string? Banco { get; set; }

        public bool Ativa { get; set; }
    }

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
}
