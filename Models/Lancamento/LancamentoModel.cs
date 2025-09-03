using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models
{
    public class LancamentoModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O tipo é obrigatório.")]
        public TipoLancamento Tipo { get; set; }

        [Required(ErrorMessage = "Valor é obrigatório.")]
        [Display(Name = "Valor")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "Descrição é obrigatória.")]
        public string Descricao { get; set; } = string.Empty;

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime DataLancamento { get; set; }

        [Required(ErrorMessage = "Data de Vencimento é obrigatória.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime DataVencimento { get; set; }

        [Required(ErrorMessage = "Data de Competência é obrigatória.")]
        [Display(Name = "Data de Competência")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime DataCompetencia { get; set; }

        public int ContaBancariaId { get; set; }
        public ContaBancaria? ContaBancaria { get; set; }

        [Required(ErrorMessage = "Plano de Contas é obrigatório.")]
        public int PlanoContaId { get; set; }
        public PlanoContasModel? PlanoContas { get; set; }

        [Required(ErrorMessage = "Pessoa é obrigatória.")]
        public int PessoaId { get; set; }
        public PessoaModel? Pessoa { get; set; }

        public int UsuarioId { get; set; }
        public UsuarioModel? Usuario { get; set; }
        public string? OfxFitId { get; set; }
        public int? LancamentoPaiId { get; set; }
        public LancamentoModel? LancamentoPai { get; set; }
        public ICollection<LancamentoModel>? Parcelas { get; set; }

        public bool Pago { get; set; } = false;

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? DataPagamento { get; set; }
    }

    public enum TipoLancamento
    {
        Receita = 1,
        Despesa = 2,
    }
}
