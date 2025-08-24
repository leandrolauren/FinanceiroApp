using System.ComponentModel.DataAnnotations;
using FinanceiroApp.Models;

namespace FinanceiroApp.Dtos
{
    public class CriarPessoaDto
    {
        public required string Nome { get; set; }

        [Required(ErrorMessage = "Informe o tipo da pessoa.")]
        public TipoPessoa? Tipo { get; set; }

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
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
        public string? RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }
        public string? Cpf { get; set; }
        public string? Rg { get; set; }
        public DateTime? DataNascimento { get; set; }
    }
    public class EditPessoaDto
    {
        public required string Nome { get; set; }

        [Required(ErrorMessage = "Informe o tipo da pessoa.")]
        public TipoPessoa? Tipo { get; set; }

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
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
        public string? RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }
        public string? Cpf { get; set; }
        public string? Rg { get; set; }
        public DateTime? DataNascimento { get; set; }
    }

    public class ListaPessoaDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public TipoPessoa Tipo { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
        public string? Complemento { get; set; }
        public string? Cep { get; set; }
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
        public string? RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }
        public string? Cpf { get; set; }
        public string? Rg { get; set; }
        public DateTime? DataNascimento { get; set; }
    }
}
