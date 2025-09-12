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
        private IConnection _connection;
        private IModel _channel;

        public EmailWorker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            var rabbitMqUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? throw new InvalidOperationException("RABBITMQ_URL não está configurada");
            var factory = new ConnectionFactory { Uri = new Uri(rabbitMqUrl), DispatchConsumersAsync = true };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

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
            _connection?.Close();
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
        }
    }
}
