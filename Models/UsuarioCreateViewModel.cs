using System.ComponentModel.DataAnnotations;

public class UsuarioCreateViewModel
{
    [Required]
    [Display(Name = "Nome")]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "Informe um email válido.")]
    [Display(Name = "E-mail")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    [MinLength(6)]
    [Display(Name = "Senha")]
    public string Senha { get; set; } = string.Empty;
}
