using System.Text;
using System.Text.Json;
using FinanceiroApp.Models;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace FinanceiroApp.Services
{
    public class EmailWorker : IHostedService, IDisposable
    {
        private readonly IServiceProvider _serviceProvider;
        private IModel _channel;
        private readonly RabbitMqService _rabbitMqService;

        public EmailWorker(IServiceProvider serviceProvider, RabbitMqService rabbitMqService)
        {
            _serviceProvider = serviceProvider;
            _rabbitMqService = rabbitMqService;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _channel = _rabbitMqService.CreateModel();

            _channel.QueueDeclare(
                queue: "email_confirmacao_queue",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );
            _channel.QueueDeclare(
                queue: "email_sucesso_queue",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.Received += async (model, ea) =>
            {
                using var scope = _serviceProvider.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

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
                            await emailService.EnviarEmailConfirmacaoAsync(
                                mensagem.Email,
                                mensagem.Token
                            );
                        }
                        else
                        {
                            await emailService.EnviarEmailSucessoAsync(mensagem.Email);
                        }
                    }

                    _channel.BasicAck(ea.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Erro ao processar mensagem: {ex.Message}");
                    _channel.BasicNack(ea.DeliveryTag, false, false);
                }
            };

            _channel.BasicConsume(
                queue: "email_confirmacao_queue",
                autoAck: false,
                consumer: consumer
            );
            _channel.BasicConsume(queue: "email_sucesso_queue", autoAck: false, consumer: consumer);

            Console.WriteLine("🚀 EmailWorker iniciado e aguardando mensagens...");
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
}
