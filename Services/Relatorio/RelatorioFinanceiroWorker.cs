using System.Text;
using System.Text.Json;
using FinanceiroApp.Models;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace FinanceiroApp.Services;

public class RelatorioFinanceiroWorker : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private IConnection _connection;
    private IModel _channel;

    public RelatorioFinanceiroWorker(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        var rabbitMqUrl =
            Environment.GetEnvironmentVariable("RABBITMQ_URL")
            ?? throw new InvalidOperationException("RABBITMQ_URL não está configurada");
        var factory = new ConnectionFactory
        {
            Uri = new Uri(rabbitMqUrl),
            DispatchConsumersAsync = true,
        };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        const string queueName = "relatorio_financeiro_queue";
        _channel.QueueDeclare(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            using var scope = _serviceProvider.CreateScope();
            var relatorioService =
                scope.ServiceProvider.GetRequiredService<IRelatorioFinanceiroService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            try
            {
                var body = ea.Body.ToArray();
                var mensagemJson = Encoding.UTF8.GetString(body);
                var mensagem = JsonSerializer.Deserialize<RelatorioFinanceiroMessage>(mensagemJson);

                if (mensagem != null)
                {
                    Console.WriteLine(
                        $"📄 Processando relatório para o usuário {mensagem.UsuarioId}..."
                    );

                    var pdfBytes = await relatorioService.GerarRelatorioPdfAsync(
                        mensagem.UsuarioId,
                        mensagem.DataInicio,
                        mensagem.DataFim,
                        mensagem.Status
                    );

                    var subject = "Seu Relatório Financeiro está pronto!";
                    var bodyEmail =
                        $"<p>Olá!</p><p>Seu relatório financeiro para o período de {mensagem.DataInicio:dd/MM/yyyy} a {mensagem.DataFim:dd/MM/yyyy} está em anexo.</p><p>Atenciosamente,<br>Galo Jhon</p>";
                    var nomeAnexo = $"Relatorio_Financeiro_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                    await emailService.EnviarEmailComAnexoAsync(
                        mensagem.EmailDestino,
                        subject,
                        bodyEmail,
                        pdfBytes,
                        nomeAnexo
                    );

                    // Aqui você poderia notificar o front-end via SignalR
                    // var hubNotificationService = scope.ServiceProvider.GetRequiredService<IHubNotificationService>();
                    // await hubNotificationService.NotificarRelatorioPronto(mensagem.UsuarioId, "Seu relatório foi enviado por e-mail!");
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao processar relatório: {ex.Message}");
                _channel.BasicNack(ea.DeliveryTag, false, false); // Não re-enfileirar
            }
        };

        _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        Console.WriteLine("📊 RelatorioFinanceiroWorker iniciado e aguardando mensagens...");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _channel?.Close();
        _connection?.Close();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}
