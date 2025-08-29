using System.Collections.Generic;
using FinanceiroApp.Models;

namespace FinanceiroApp.Dtos
{
    public abstract class PlanoContaResultadoBase
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public MovimentoTipo Tipo { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }

    public abstract class PlanoContaManipulacaoBase
    {
        public required string Descricao { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }

    public class CriarPlanoContaDto : PlanoContaManipulacaoBase
    {
        public MovimentoTipo Tipo { get; set; }
    }

    public class EditPlanoContaDto : PlanoContaManipulacaoBase { }

    public class PlanoContaCriadoDto : PlanoContaResultadoBase { }

    public class PlanoContasDto : PlanoContaResultadoBase
    {
        public decimal Total { get; set; }
        public List<PlanoContasDto> Filhos { get; set; } = new();
    }

    public class MigracaoPlanoContaDto
    {
        public int PlanoContaDestinoId { get; set; }
    }

    public class PlanoContaComTotalDto
    {
        public int Id { get; set; }
        public string? Descricao { get; set; }
        public MovimentoTipo Tipo { get; set; }
        public bool Padrao { get; set; }
        public decimal TotalReceitas { get; set; }
        public decimal TotalDespesas { get; set; }
    }
}
