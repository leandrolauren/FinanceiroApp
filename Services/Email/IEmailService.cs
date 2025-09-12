using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services;

public interface IEmailService
{
    Task EnviarEmailConfirmacaoAsync(string to, string token);
    Task EnviarEmailSucessoAsync(string to);
    Task EnviarEmailComAnexoAsync(
        string to,
        string subject,
        string body,
        byte[] anexo,
        string nomeAnexo
    );
    Task EnviarEmailRelatorioAsync(
        string to,
        RelatorioFinanceiroDados dadosRelatorio,
        byte[] anexo,
        string nomeAnexo
    );
}
