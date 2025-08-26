using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FinanceiroApp.Models;

public class PlanoContasModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Informe a descrição.")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o tipo do Plano.")]
    public MovimentoTipo Tipo { get; set; }
    public int UsuarioId { get; set; }
    public UsuarioModel? Usuario { get; set; }
    public int? PlanoContasPaiId { get; set; }
    public PlanoContasModel? PlanoContasPai { get; set; }
    public ICollection<PlanoContasModel> Filhos { get; set; } = [];

    public ICollection<LancamentoModel> Lancamentos { get; set; } = [];

    public bool PodeLancar => !Filhos.Any();
}

public class PlanoContasEditViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Informe a descrição.")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "Informe o tipo do Plano.")]
    public MovimentoTipo Tipo { get; set; }

    public int? PlanoContasPaiId { get; set; }

    public List<SelectListItem> PlanosContasPaisDisponiveis { get; set; } = [];
}

public enum MovimentoTipo
{
    Receita = 1,
    Despesa = 2,
}
