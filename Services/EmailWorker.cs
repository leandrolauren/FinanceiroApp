using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using FinanceiroApp.Models;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace FinanceiroApp.Services
{
    public class EmailWorker : IEmailWorker
    {
        private readonly SmtpSettings _smtpSettings;
        private readonly ConnectionFactory _factory;

        public EmailWorker(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;

            _factory = new ConnectionFactory
            {
                HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
                DispatchConsumersAsync = true,
            };
        }

        public void Start()
        {
            var connection = _factory.CreateConnection();
            var channel = connection.CreateModel();

            channel.QueueDeclare(
                queue: "email_confirmacao_queue",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );
            channel.QueueDeclare(
                queue: "email_sucesso_queue",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var mensagemJson = Encoding.UTF8.GetString(body);
                    var mensagem = JsonSerializer.Deserialize<EmailConfirmacaoMessage>(
                        mensagemJson
                    );

                    if (mensagem != null)
                    {
                        if (!string.IsNullOrEmpty(mensagem.Token))
                        {
                            await EnviarEmailConfirmacaoAsync(mensagem.Email, mensagem.Token);
                        }
                        else
                        {
                            await EnviarEmailSucessoAsync(mensagem.Email);
                        }
                    }

                    channel.BasicAck(ea.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Erro ao processar mensagem: {ex.Message}");
                    channel.BasicNack(ea.DeliveryTag, false, false);
                }
            };

            channel.BasicConsume(
                queue: "email_confirmacao_queue",
                autoAck: false,
                consumer: consumer
            );
            channel.BasicConsume(queue: "email_sucesso_queue", autoAck: false, consumer: consumer);

            Console.WriteLine("🚀 EmailWorker iniciado e aguardando mensagens...");
        }

        private async Task EnviarEmailConfirmacaoAsync(string to, string token)
        {
            var link = $"http://localhost:5084/usuario/confirmar?token={token}";
            var subject = "Confirme seu cadastro - Financeiro App";
            var body =
                $@"
            <h2>Bem-Vindo(a) ao <b>Financeiro App</b>!</h2>
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
            </p>
            <hr>
            <img src='https://i.imgur.com/your-logo.png' alt='Logo' width='120'/>";

            await EnviarEmailAsync(to, subject, body);
        }

        private async Task EnviarEmailSucessoAsync(string to)
        {
            var subject = "Cadastro confirmado com sucesso";
            var body =
                "Obrigado por se cadastrar no FinanceiroApp. Seu e-mail foi confirmado com sucesso!";

            await EnviarEmailAsync(to, subject, body);
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
}
