using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class MovimentacaoBancaria
{
    public long Id { get; set; }

    [Required]
    public DateTime DataMovimentacao { get; set; }

    [Required]
    public TipoMovimentacao TipoMovimentacao { get; set; }

    [Required]
    public decimal Valor { get; set; }

    [Required]
    public string Historico { get; set; }

    // Chaves estrangeiras
    [Required]
    public int ContaBancariaId { get; set; }
    public ContaBancaria ContaBancaria { get; set; }

    // O lançamento que originou a movimentação
    public int? LancamentoId { get; set; }
    public LancamentoModel? Lancamento { get; set; }

    [Required]
    public int UsuarioId { get; set; }
    public UsuarioModel Usuario { get; set; }
}

public enum TipoMovimentacao
{
    Entrada = 1,
    Saida = 2,
}