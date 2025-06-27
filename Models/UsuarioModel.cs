using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class UsuarioModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Informe um email válido.")]
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;

    public ICollection<PlanoContasModel>? Planos { get; set; } = new List<PlanoContasModel>();
    public ICollection<LancamentoModel>? Lancamentos { get; set; } = new List<LancamentoModel>();
    public ICollection<PessoaModel>? Pessoas { get; set; } = new List<PessoaModel>();
}
