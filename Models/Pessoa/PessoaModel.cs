using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class PessoaModel : IValidatableObject
{
    public int Id { get; set; }
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
    public int UsuarioId { get; set; }
    public UsuarioModel? Usuario { get; set; }

    public ICollection<LancamentoModel> Lancamentos { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Tipo == TipoPessoa.Fisica && string.IsNullOrWhiteSpace(Cpf))
        {
            yield return new ValidationResult(
                "CPF é obrigatório para pessoas físicas.",
                [nameof(Cpf)]
            );
        }
        if (Tipo == TipoPessoa.Fisica && string.IsNullOrWhiteSpace(Nome))
        {
            yield return new ValidationResult("Nome é obrigatório.", [nameof(Nome)]);
        }

        if (Tipo == TipoPessoa.Juridica && string.IsNullOrWhiteSpace(Cnpj))
        {
            yield return new ValidationResult(
                "CNPJ é obrigatório para pessoas jurídicas.",
                [nameof(Cnpj)]
            );
        }
        if (Tipo == TipoPessoa.Juridica && string.IsNullOrWhiteSpace(RazaoSocial))
        {
            yield return new ValidationResult(
                "Razão Social é obrigatório para pessoas Jurídicas.",
                [nameof(RazaoSocial)]
            );
        }
    }
}

public enum TipoPessoa
{
    Fisica = 1,
    Juridica = 2,
}
