using System.Text;
using System.Text.Json;
using FinanceiroApp.Models;
using RabbitMQ.Client;

namespace FinanceiroApp.Services
{
    public class RabbitMqService : IRabbitMqService
    {
        private readonly ConnectionFactory _factory;

        public RabbitMqService()
        {
            var rabbitMqUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL");

            if (string.IsNullOrEmpty(rabbitMqUrl))
            {
                throw new InvalidOperationException(
                    "RABBITMQ_URL não está configurada nas variáveis de ambiente."
                );
            }

            _factory = new ConnectionFactory
            {
                Uri = new Uri(rabbitMqUrl),
                DispatchConsumersAsync = true,
            };
        }

        public void PublicarMensagem(string fila, EmailConfirmacaoMessage mensagem)
        {
            using var connection = _factory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(
                fila,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var json = JsonSerializer.Serialize(mensagem);
            var body = Encoding.UTF8.GetBytes(json);

            channel.BasicPublish(exchange: "", routingKey: fila, basicProperties: null, body: body);
            Console.WriteLine($"📤 Mensagem publicada na fila '{fila}' para {mensagem.Email}");
        }
    }
}
