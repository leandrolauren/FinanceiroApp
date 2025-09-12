using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Models;

public class RelatorioGeradoModel
{
    public Guid Id { get; set; }

    [Required]
    public int UsuarioId { get; set; }
    public UsuarioModel Usuario { get; set; }

    [Required, MaxLength(100)]
    public string TipoRelatorio { get; set; }

    [Required]
    public string Parametros { get; set; } // JSON com os filtros usados

    [Required]
    public StatusRelatorio Status { get; set; }

    public string? Resultado { get; set; } // JSON com os dados do relatório
    public string? MensagemErro { get; set; }
    public DateTime DataSolicitacao { get; set; }
    public DateTime? DataConclusao { get; set; }
}

public enum StatusRelatorio { Processando, Concluido, Falha }
