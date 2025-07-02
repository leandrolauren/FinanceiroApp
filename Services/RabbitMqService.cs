using System.Text;
using System.Text.Json;
using FinanceiroApp.Models;
using RabbitMQ.Client;

namespace FinanceiroApp.Services
{
    public class RabbitMqService : IRabbitMqService
    {
        private readonly ConnectionFactory _factory;

        public RabbitMqService(string hostName)
        {
            _factory = new ConnectionFactory() { HostName = hostName };
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
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(mensagem));

            channel.BasicPublish(exchange: "", routingKey: fila, basicProperties: null, body: body);
            Console.WriteLine($"📤 Mensagem publicada na fila '{fila}' para {mensagem.Email}");
        }
    }
}
