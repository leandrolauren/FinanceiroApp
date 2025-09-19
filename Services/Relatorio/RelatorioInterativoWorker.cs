using System.Text;
using System.Text.Json;
using FinanceiroApp.Data;
using FinanceiroApp.Hubs;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;

namespace FinanceiroApp.Services;

public class RelatorioInterativoWorker : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRabbitMqService _rabbitMqService;
    private IModel _channel;

    public RelatorioInterativoWorker(IServiceProvider serviceProvider, IRabbitMqService rabbitMqService)
    {
        _serviceProvider = serviceProvider;
        _rabbitMqService = rabbitMqService;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _channel = _rabbitMqService.CreateModel();

        const string queueName = "relatorio_interativo_queue";
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
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var relatorioService =
                scope.ServiceProvider.GetRequiredService<IRelatorioFinanceiroService>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<RelatorioHub>>();

            var body = ea.Body.ToArray();
            var mensagem = JsonSerializer.Deserialize<RelatorioInterativoMessage>(
                Encoding.UTF8.GetString(body)
            );

            if (mensagem == null)
            {
                _channel.BasicNack(ea.DeliveryTag, false, false);
                return;
            }

            var relatorioDb = await context.RelatoriosGerados.FindAsync(mensagem.RelatorioId);
            if (relatorioDb == null)
            {
                _channel.BasicNack(ea.DeliveryTag, false, false);
                return;
            }

            try
            {
                Console.WriteLine($"📊 Processando relatório interativo {mensagem.RelatorioId}...");
                var dados = await relatorioService.GerarDadosRelatorioAsync(
                    mensagem.UsuarioId,
                    mensagem.DataInicio,
                    mensagem.DataFim,
                    mensagem.Status
                );

                relatorioDb.Resultado = JsonSerializer.Serialize(dados);
                relatorioDb.Status = StatusRelatorio.Concluido;
                relatorioDb.DataConclusao = DateTime.UtcNow;

                await context.SaveChangesAsync();
                _channel.BasicAck(ea.DeliveryTag, false);
                Console.WriteLine($"✅ Relatório interativo {mensagem.RelatorioId} concluído.");

                await hubContext.Clients.All.SendAsync("RelatorioPronto", relatorioDb.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao processar relatório interativo: {ex.Message}");
                relatorioDb.Status = StatusRelatorio.Falha;
                relatorioDb.MensagemErro = ex.Message;
                relatorioDb.DataConclusao = DateTime.UtcNow;
                await context.SaveChangesAsync();
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        Console.WriteLine("📊 Relatório Interativo Worker iniciado.");
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
