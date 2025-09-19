using System.Net;
using System.Net.Mail;
using FinanceiroApp.Dtos;
using Microsoft.Extensions.Options;

namespace FinanceiroApp.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly string _serverHost;

    public EmailService(IOptions<SmtpSettings> smtpSettings)
    {
        _smtpSettings = smtpSettings.Value;
        _serverHost = Environment.GetEnvironmentVariable("SERVER_HOST") 
            ?? throw new InvalidOperationException("A variável de ambiente 'SERVER_HOST' não foi definida.");
    }

    private string GetEmailFooter()
    {
        var logoUrl = "https://i.imgur.com/42QmCee.png";
        return $@"
        <hr>
        <p style='font-size:14px;'>Atenciosamente,<br>
        <b>Equipe FinanceiroApp</b> <img src='{logoUrl}' alt='Logo FinanceiroApp' style='width:30px; height:30px; vertical-align:middle;'/></p>
        <p style='font-size:12px; color:#888;'>
            Desenvolvido por <b>Leandro Laurenzette</b> | <a href='https://www.linkedin.com/in/leandro-laurenzette-3b03a2167/' target='_blank'>LinkedIn</a>
        </p>
    ";
    }

    public async Task EnviarEmailConfirmacaoAsync(string to, string token)
    {
        var link = $"{_serverHost}/Usuario/Confirmar?token={token}";
        var subject = "Confirme seu cadastro - Financeiro App";
        var body =
            $@"<h2>Bem-Vindo(a) ao <b>Financeiro App</b>!</h2>
        <p>Obrigado por se cadastrar.</p>
        <p><b>Clique no botão abaixo para confirmar seu e-mail:</b></p>
        <p>
            <a href='{link}' style='
                display:inline-block;
                padding:10px 20px;
                background:#1976d2;
                color:#fff;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;'>Confirmar Cadastro</a>
        </p>
        <p>Ou copie e cole este link no navegador:<br>
            <a href='{link}'>{link}</a>
        </p>{GetEmailFooter()}
        ";

        await EnviarEmailAsync(to, subject, body);
    }

    public async Task EnviarEmailSucessoAsync(string to)
    {
        var subject = "Cadastro confirmado - Financeiro App";
        var body =
            $@"<h2>Obrigado por se cadastrar no FinanceiroApp!</h2>
             <p>Seu e-mail foi confirmado com sucesso!</p>
             <p>Agora você pode acessar sua conta e começar a gerenciar suas finanças.</p>
             {GetEmailFooter()}";

        await EnviarEmailAsync(to, subject, body);
    }

    public async Task EnviarEmailRelatorioAsync(string to, RelatorioFinanceiroDados dadosRelatorio, byte[] anexo, string nomeAnexo)
    {
        var subject =
            $"Seu Relatório Financeiro de {dadosRelatorio.DataInicio:dd/MM/yyyy} a {dadosRelatorio.DataFim:dd/MM/yyyy}";
        var body =
            $@"<p>Olá, <b>{dadosRelatorio.NomeUsuario}</b>!</p><p>Conforme solicitado, segue em anexo o seu relatório financeiro para o período de <b>{dadosRelatorio.DataInicio:dd/MM/yyyy}</b> a <b>{dadosRelatorio.DataFim:dd/MM/yyyy}</b>.</p><p>Esperamos que ajude em sua organização!</p>{GetEmailFooter()}";

        await EnviarEmailComAnexoAsync(to, subject, body, anexo, nomeAnexo);
    }

    public async Task EnviarEmailComAnexoAsync(
        string to,
        string subject,
        string body,
        byte[] anexo,
        string nomeAnexo
    )
    {
        using var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_smtpSettings.User, _smtpSettings.Password),
        };

        var message = new MailMessage
        {
            From = new MailAddress(_smtpSettings.User, _smtpSettings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };

        message.To.Add(to);
        message.Attachments.Add(
            new Attachment(new MemoryStream(anexo), nomeAnexo, "application/pdf")
        );

        await client.SendMailAsync(message);
        Console.WriteLine($"📧 E-mail com anexo enviado para {to}: {subject}");
    }

    private async Task EnviarEmailAsync(string to, string subject, string body)
    {
        using var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_smtpSettings.User, _smtpSettings.Password),
        };

        var message = new MailMessage
        {
            From = new MailAddress(_smtpSettings.User, _smtpSettings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };
        message.To.Add(to);
        await client.SendMailAsync(message);
        Console.WriteLine($"📧 E-mail enviado para {to}: {subject}");
    }
}
