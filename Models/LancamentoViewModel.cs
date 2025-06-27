using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class LancamentoViewModel
{
    [Required(ErrorMessage = "O tipo é obrigatório.")]
    public TipoLancamento Tipo { get; set; }

    [Required(ErrorMessage = "Valor é obrigatório.")]
    public decimal Valor { get; set; }
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "Data de Vencimento é obrigatória.")]
    public DateTime DataVencimento { get; set; }

    [Required(ErrorMessage = "Data de Competência é obrigatória.")]
    public DateTime DataCompetencia { get; set; }
    public int ContaBancariaId { get; set; }

    [Required(ErrorMessage = "Plano de Contas é obrigatório.")]
    public int PlanoContaId { get; set; }

    [Required(ErrorMessage = "Pessoa é obrigatória.")]
    public int PessoaId { get; set; }
    public int UsuarioId { get; set; }
    public int? LancamentoPaiId { get; set; }
    public bool Pago { get; set; }
    public DateTime? DataPagamento { get; set; }
}
