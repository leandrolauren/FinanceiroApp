using RabbitMQ.Client;

public interface IRabbitMqService
{
    void PublicarMensagem<T>(string fila, T mensagem);

    IModel CreateModel();
}
