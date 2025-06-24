using System.ComponentModel.DataAnnotations;

public class LoginViewModel
{
    [Required(ErrorMessage = "E-mail obrigatório")]
    [EmailAddress]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Senha obrigatória")]
    [DataType(DataType.Password)]
    public required string Senha { get; set; }
}
