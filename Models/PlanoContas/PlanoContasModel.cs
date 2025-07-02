using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FinanceiroApp.Models;

public class PlanoContasModel
{
    public int Id { get; set; }
    public string? Descricao { get; set; }
    public string? Tipo { get; set; }
    public int UsuarioId { get; set; }
    public UsuarioModel? Usuario { get; set; }
    public int? PlanoContasPaiId { get; set; }
    public PlanoContasModel? PlanoContasPai { get; set; }
    public ICollection<PlanoContasModel> Filhos { get; set; } = new List<PlanoContasModel>();

    public ICollection<LancamentoModel> Lancamentos { get; set; } = new List<LancamentoModel>();

    public bool PodeLancar => !Filhos.Any();
}

public class PlanoContasEditViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Informe a descrição.")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o tipo do Plano.")]
    public string Tipo { get; set; } = string.Empty;

    public int? PlanoContasPaiId { get; set; }

    public List<SelectListItem> PlanosContasPaisDisponiveis { get; set; } = new();
}
