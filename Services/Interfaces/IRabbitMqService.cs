public interface IRabbitMqService
{
    void PublicarMensagem<T>(string fila, T mensagem);
}
