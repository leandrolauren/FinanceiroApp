using FinanceiroApp.Models; // Certifique-se que este using já existe ou adicione-o
using Newtonsoft.Json;

namespace FinanceiroApp.Dtos
{
    public abstract class PlanoContaResultadoBase
    {
        [JsonProperty(Order = 1)]
        public int Id { get; set; }

        [JsonProperty(Order = 2)]
        public required string Descricao { get; set; }

        [JsonProperty(Order = 3)]
        public TipoLancamento Tipo { get; set; }

        [JsonProperty(Order = 4)]
        public int? PlanoContasPaiId { get; set; }
    }

    public abstract class PlanoContaManipulacaoBase
    {
        public required string Descricao { get; set; }
        public int? PlanoContasPaiId { get; set; }
    }

    public class CriarPlanoContaDto : PlanoContaManipulacaoBase
    {
        public TipoLancamento Tipo { get; set; }
    }

    public class EditPlanoContaDto : PlanoContaManipulacaoBase { }

    public class PlanoContaCriadoDto : PlanoContaResultadoBase { }

    public class PlanoContasDto : PlanoContaResultadoBase
    {
        [JsonProperty(Order = 5)]
        public decimal Total { get; set; }

        [JsonProperty(Order = 6)]
        public List<PlanoContasDto> Filhos { get; set; } = [];
    }

    public class MigracaoPlanoContaDto
    {
        public int PlanoContaDestinoId { get; set; }
    }
}
