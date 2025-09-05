using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FinanceiroApp.Dtos
{
    public class ParseFileRequestDto
    {
        [Required(ErrorMessage = "O arquivo é obrigatório.")]
        public IFormFile File { get; set; }

        [Required(ErrorMessage = "O tipo do arquivo é obrigatório.")]
        public string FileType { get; set; }

        [Required(ErrorMessage = "A conta bancária é obrigatória.")]
        [Range(1, int.MaxValue, ErrorMessage = "ID da conta bancária inválido.")]
        public int ContaBancariaId { get; set; }

        [Required(ErrorMessage = "A data de início é obrigatória.")]
        public DateTime DataInicio { get; set; }

        [Required(ErrorMessage = "A data de fim é obrigatória.")]
        public DateTime DataFim { get; set; }
    }
}