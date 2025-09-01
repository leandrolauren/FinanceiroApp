using FinanceiroApp.Models;

namespace FinanceiroApp.Services;

public interface IMovimentacaoBancariaService
{
    Task RegistrarMovimentacaoDePagamento(LancamentoModel lancamento);
    Task RegistrarMovimentacaoDeEstorno(LancamentoModel lancamento);
}