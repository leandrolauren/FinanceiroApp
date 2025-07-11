using System.ComponentModel.DataAnnotations;

public class UsuarioCreateViewModel
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public required string Nome { get; set; }

    [Required(ErrorMessage = "O email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Por favor, digite um email válido.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [StringLength(
        100,
        MinimumLength = 6,
        ErrorMessage = "A senha deve ter pelo menos 6 caracteres."
    )]
    public required string Senha { get; set; }
}
