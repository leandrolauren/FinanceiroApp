using System.ComponentModel.DataAnnotations;
using FinanceiroApp.Models;

namespace FinanceiroApp.Dtos
{
    public abstract class BasePessoaDto
    {
        [Required(ErrorMessage = "Informe o nome da pessoa.")]
        public required string Nome { get; set; }

        [EmailAddress(ErrorMessage = "Informe um email válido.")]
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
        public string? Complemento { get; set; }
        public string? Cep { get; set; }

        [RegularExpression(@"^\d{14}$", ErrorMessage = "O CNPJ deve conter exatamente 14 dígitos.")]
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
        public string? RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }

        [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve conter exatamente 11 números.")]
        public string? Cpf { get; set; }
        public string? Rg { get; set; }
        public DateTime? DataNascimento { get; set; }
    }

    public class CriarPessoaDto : BasePessoaDto
    {
        [Required(ErrorMessage = "Informe o tipo da pessoa.")]
        public TipoPessoa? Tipo { get; set; }
    }

    public class EditPessoaDto : BasePessoaDto { }

    public class ListaPessoaDto : BasePessoaDto
    {
        public int Id { get; set; }
        public TipoPessoa Tipo { get; set; }
    }
}
