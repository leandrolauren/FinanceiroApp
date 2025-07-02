namespace FinanceiroApp.Models
{
    public class EmailConfirmacaoMessage
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string UrlConfirmacao { get; set; } = string.Empty;
    }
}
