using System.Text;
using System.Text.Json;
using FinanceiroApp.Data;
using FinanceiroApp.Hubs;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace FinanceiroApp.Services;

public class ExtratoCategoriaWorker : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IRabbitMqService _rabbitMqService;
    private IModel _channel;

    public ExtratoCategoriaWorker(
        IServiceProvider serviceProvider,
        IRabbitMqService rabbitMqService
    )
    {
        _serviceProvider = serviceProvider;
        _rabbitMqService = rabbitMqService;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _channel = _rabbitMqService.CreateModel();

        const string queueName = "extrato_categoria_queue";
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
            var mensagem = JsonSerializer.Deserialize<ExtratoCategoriaMessage>(
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
                Console.WriteLine(
                    $"📊 Processando extrato por categoria {mensagem.RelatorioId}..."
                );
                var dados = await relatorioService.GerarDadosExtratoCategoriaAsync(
                    mensagem.UsuarioId,
                    mensagem.DataInicio,
                    mensagem.DataFim,
                    mensagem.PlanoContaId,
                    mensagem.Status
                );

                relatorioDb.Resultado = JsonSerializer.Serialize(dados);
                relatorioDb.Status = StatusRelatorio.Concluido;
                relatorioDb.DataConclusao = DateTime.UtcNow;

                await context.SaveChangesAsync();
                _channel.BasicAck(ea.DeliveryTag, false);
                Console.WriteLine($"✅ Extrato por categoria {mensagem.RelatorioId} concluído.");

                await hubContext.Clients.All.SendAsync("RelatorioPronto", relatorioDb.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao processar extrato por categoria: {ex.Message}");
                relatorioDb.Status = StatusRelatorio.Falha;
                relatorioDb.MensagemErro = ex.Message;
                relatorioDb.DataConclusao = DateTime.UtcNow;
                await context.SaveChangesAsync();
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        Console.WriteLine("📊 Extrato por Categoria Worker iniciado.");
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
