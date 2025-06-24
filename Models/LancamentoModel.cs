namespace FinanceiroApp.Models
{
    public class LancamentoModel
    {
        public int Id { get; set; }

        public TipoLancamento Tipo { get; set; } // Receita ou Despesa

        public decimal Valor { get; set; }

        public string? Descricao { get; set; }

        public DateTime DataLancamento { get; set; } = DateTime.UtcNow;
        public DateTime DataVencimento { get; set; }
        public DateTime DataCompetencia { get; set; }

        public int ContaBancariaId { get; set; }
        public ContaBancaria? ContaBancaria { get; set; }

        public int PlanoContaId { get; set; }
        public PlanoContasModel? PlanoContas { get; set; }

        public int PessoaId { get; set; }
        public PessoaModel? Pessoa { get; set; }

        public int UsuarioId { get; set; }
        public UsuarioModel? Usuario { get; set; }

        public int? LancamentoPaiId { get; set; } // para controle de parcelamentos
        public LancamentoModel? LancamentoPai { get; set; }
        public ICollection<LancamentoModel>? Parcelas { get; set; }

        public bool Pago { get; set; } = false;
        public DateTime? DataPagamento { get; set; }
    }

    public enum TipoLancamento
    {
        Receita = 1,
        Despesa = 2,
    }
}
