using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinanceiroApp.Models;

public class UsuarioModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Informe um email válido.")]
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public bool PrimeiroAcesso { get; set; } = true;

    [JsonIgnore]
    public ICollection<PlanoContasModel>? Planos { get; set; } = [];

    [JsonIgnore]
    public ICollection<LancamentoModel>? Lancamentos { get; set; } = [];

    [JsonIgnore]
    public ICollection<PessoaModel>? Pessoas { get; set; } = [];
}
