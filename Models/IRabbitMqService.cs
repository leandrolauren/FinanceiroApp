using FinanceiroApp.Models;

public interface IRabbitMqService
{
    void PublicarMensagem(string fila, EmailConfirmacaoMessage mensagem);
}
