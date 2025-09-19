using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;

namespace FinanceiroApp.Services
{
    public class RabbitMqService : IRabbitMqService, IDisposable
    {
        private readonly IConnection _connection;

        public RabbitMqService()
        {
            var host = (Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost").Trim(
                '"',
                ' '
            );
            var port = (Environment.GetEnvironmentVariable("RABBITMQ_PORT") ?? "5672").Trim(
                '"',
                ' '
            );
            var user = Environment.GetEnvironmentVariable("RABBITMQ_USER");
            var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS");

            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
            {
                throw new InvalidOperationException(
                    "As variáveis de ambiente RABBITMQ_USER e RABBITMQ_PASS devem ser configuradas."
                );
            }

            var rabbitMqUrl = $"amqp://{user}:{pass}@{host}:{port}";
            var factory = new ConnectionFactory
            {
                Uri = new Uri(rabbitMqUrl),
                DispatchConsumersAsync = true,
                AutomaticRecoveryEnabled = true,
            };

            const int maxRetries = 5;
            var delay = TimeSpan.FromSeconds(5);

            for (var i = 0; i < maxRetries; i++)
            {
                try
                {
                    _connection = factory.CreateConnection();
                    Console.WriteLine("✅ Conexão com RabbitMQ estabelecida com sucesso.");
                    break;
                }
                catch (BrokerUnreachableException ex)
                {
                    if (i < maxRetries - 1)
                    {
                        Console.WriteLine(
                            $"⚠️ Falha ao conectar ao RabbitMQ (tentativa {i + 1}/{maxRetries}). Tentando novamente em {delay.TotalSeconds}s... Erro: {ex.Message}"
                        );
                        Thread.Sleep(delay);
                    }
                    else
                    {
                        Console.WriteLine(
                            "❌ Não foi possível conectar ao RabbitMQ após várias tentativas."
                        );
                        throw;
                    }
                }
            }
        }

        public void PublicarMensagem<T>(string fila, T mensagem)
        {
            using var channel = _connection.CreateModel();

            var json = JsonSerializer.Serialize(mensagem);
            var body = Encoding.UTF8.GetBytes(json);

            channel.BasicPublish(exchange: "", routingKey: fila, basicProperties: null, body: body);

            Console.WriteLine(
                $"📤 Mensagem do tipo '{typeof(T).Name}' publicada na fila '{fila}'."
            );
        }

        public IModel CreateModel()
        {
            return _connection.CreateModel();
        }

        public void Dispose()
        {
            _connection?.Dispose();
        }
    }
}
