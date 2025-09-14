using System.ComponentModel.DataAnnotations;

namespace FinanceiroApp.Dtos;

public class GerarRelatorioRequestDto
{
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public required string Status { get; set; }
}

public class GerarExtratoCategoriaRequestDto
{
    [Required]
    public DateTime DataInicio { get; set; }

    [Required]
    public DateTime DataFim { get; set; }

    [Required]
    public int PlanoContaId { get; set; }
    public required string Status { get; set; }
}

public class RelatorioGeradoDto
{
    public Guid Id { get; set; }
    public required string TipoRelatorio { get; set; }
    public required string Parametros { get; set; }
    public required string Status { get; set; }
    public DateTime DataSolicitacao { get; set; }
    public DateTime? DataConclusao { get; set; }
    public string? Resultado { get; set; }
}

public class EnviarEmailRequestDto
{
    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    public required string Email { get; set; }
}
