using System.Text;
using System.Text.Json;
using FinanceiroApp.Hubs;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;

namespace FinanceiroApp.Services;

public class RelatorioFinanceiroWorker : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRabbitMqService _rabbitMqService;
    private IModel _channel;

    public RelatorioFinanceiroWorker(IServiceProvider serviceProvider, IRabbitMqService rabbitMqService)
    {
        _serviceProvider = serviceProvider;
        _rabbitMqService = rabbitMqService;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _channel = _rabbitMqService.CreateModel();

        const string queueName = "relatorio_financeiro_queue";
        _channel.QueueDeclare(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false
        );

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            using var scope = _serviceProvider.CreateScope();
            var relatorioService =
                scope.ServiceProvider.GetRequiredService<IRelatorioFinanceiroService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<RelatorioHub>>();

            RelatorioFinanceiroMessage mensagem = null;
            try
            {
                var body = ea.Body.ToArray();
                var mensagemJson = Encoding.UTF8.GetString(body);
                mensagem = JsonSerializer.Deserialize<RelatorioFinanceiroMessage>(mensagemJson);

                if (mensagem == null)
                {
                    _channel.BasicNack(ea.DeliveryTag, false, false);
                    return;
                }

                Console.WriteLine(
                    $"📄 Processando relatório para o usuário {mensagem.UsuarioId}..."
                );

                var (pdfBytes, dadosRelatorio) = await relatorioService.GerarRelatorioPdfAsync(
                    mensagem.UsuarioId,
                    mensagem.DataInicio,
                    mensagem.DataFim,
                    mensagem.Status
                );

                var nomeAnexo = $"Relatorio_Financeiro_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                await emailService.EnviarEmailRelatorioAsync(
                    mensagem.EmailDestino,
                    dadosRelatorio,
                    pdfBytes,
                    nomeAnexo
                );

                await hubContext.Clients.All.SendAsync(
                    "ExibirNotificacao",
                    new
                    {
                        UsuarioId = mensagem.UsuarioId,
                        Mensagem = "Seu relatório financeiro foi enviado por e-mail com sucesso."
                    }
                );

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao processar relatório: {ex.Message}");
                if (mensagem != null)
                {
                    await hubContext.Clients.All.SendAsync(
                        "ExibirNotificacao",
                        new
                        {
                            UsuarioId = mensagem.UsuarioId,
                            Mensagem = "Ocorreu um erro ao gerar e enviar seu relatório por e-mail.",
                            Tipo = "Erro"
                        }
                    );
                }
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        Console.WriteLine("📊 RelatorioFinanceiroWorker iniciado e aguardando mensagens...");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _channel?.Close();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Dispose();
    }
}
