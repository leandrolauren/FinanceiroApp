using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Dtos
{
    public abstract class BaseLancamentoDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [MaxLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "A data de competência é obrigatória.")]
        public DateTime DataCompetencia { get; set; }

        [Required(ErrorMessage = "A data de vencimento é obrigatória.")]
        public DateTime DataVencimento { get; set; }

        public DateTime? DataPagamento { get; set; }

        public bool Pago { get; set; }

        public int? ContaBancariaId { get; set; }

        [Required(ErrorMessage = "O plano de contas é obrigatório.")]
        [Range(1, int.MaxValue, ErrorMessage = "ID do plano de contas inválido.")]
        public int PlanoContasId { get; set; }

        [Required(ErrorMessage = "A pessoa é obrigatória.")]
        [Range(1, int.MaxValue, ErrorMessage = "ID da pessoa inválido.")]
        public int PessoaId { get; set; }
    }

    public class CriarLancamentoDto : BaseLancamentoDto
    {
        [Required(ErrorMessage = "O tipo (Receita/Despesa) é obrigatório.")]
        [RegularExpression(
            "^[RD]$",
            ErrorMessage = "O tipo deve ser 'R' para Receita ou 'D' para Despesa."
        )]
        public string Tipo { get; set; } = string.Empty;

        public bool Parcelado { get; set; }

        [Range(2, int.MaxValue, ErrorMessage = "Um lançamento parcelado precisa ter no mínimo duas parcelas.")]
        public int? QuantidadeParcelas { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "O intervalo entre parcelas deve ser de pelo menos 1 dia.")]
        public int? IntervaloDiasParcelas { get; set; }

        public List<ParcelaLancamentoDto>? Parcelas { get; set; }
    }

    public class LancamentoEditDto : BaseLancamentoDto { }

    public class DetalhesLancamentoDto
    {
        public int Id { get; set; }
        public required string Descricao { get; set; }
        public required string Tipo { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataCompetencia { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public DateTime DataLancamento { get; set; }
        public bool Pago { get; set; }

        public PessoaSimplificadaDto? Pessoa { get; set; }
        public PlanoContasSimplificadoDto? PlanoContas { get; set; }
        public ContaBancariaSimplificadaDto? ContaBancaria { get; set; }
    }

    public class ParcelaLancamentoDto
    {
        [Range(1, 10, ErrorMessage = "O número da parcela precisa estar entre 1 e 10.")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "A data de competência da parcela é obrigatória.")]
        public DateTime DataCompetencia { get; set; }

        [Required(ErrorMessage = "A data de vencimento da parcela é obrigatória.")]
        public DateTime DataVencimento { get; set; }

        public DateTime? DataPagamento { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "O valor da parcela deve ser maior que zero.")]
        public decimal Valor { get; set; }
    }

    public class LancamentoRelatorioDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public string Tipo { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
        public bool Pago { get; set; }

        public PessoaSimplificadaDto? Pessoa { get; set; }
        public PlanoContasSimplificadoDto? PlanoContas { get; set; }
        public ContaBancariaSimplificadaDto? ContaBancaria { get; set; }
    }

    public class PessoaSimplificadaDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
    }

    public class PlanoContasSimplificadoDto
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
    }

    public class ContaBancariaSimplificadaDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
    }
}
