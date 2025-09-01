using FinanceiroApp.Data;
using FinanceiroApp.Models;

namespace FinanceiroApp.Services;

public class MovimentacaoBancariaService(
    ApplicationDbContext context,
    ILogger<MovimentacaoBancariaService> logger
) : IMovimentacaoBancariaService
{
    public async Task RegistrarMovimentacaoDePagamento(LancamentoModel lancamento)
    {
        if (
            !lancamento.Pago
            || lancamento.ContaBancariaId <= 0
            || !lancamento.DataPagamento.HasValue
        )
            throw new InvalidOperationException(
                "Lançamento inválido para registrar movimentação de pagamento."
            );

        var movimentacao = new MovimentacaoBancaria
        {
            DataMovimentacao = lancamento.DataPagamento.Value,
            Valor = lancamento.Valor,
            Historico = $"PGTO: {lancamento.Descricao}",
            ContaBancariaId = lancamento.ContaBancariaId,
            UsuarioId = lancamento.UsuarioId,
            Lancamento = lancamento,
        };

        var conta =
            await context.ContasBancarias.FindAsync(lancamento.ContaBancariaId)
            ?? throw new KeyNotFoundException(
                $"Conta bancária ID {lancamento.ContaBancariaId} não encontrada."
            );

        if (lancamento.Tipo == TipoLancamento.Receita)
        {
            movimentacao.TipoMovimentacao = TipoMovimentacao.Entrada;
            conta.Saldo += lancamento.Valor;
        }
        else
        {
            movimentacao.TipoMovimentacao = TipoMovimentacao.Saida;
            conta.Saldo -= lancamento.Valor;
        }

        await context.MovimentacoesBancarias.AddAsync(movimentacao);
        context.ContasBancarias.Update(conta);
    }

    public async Task RegistrarMovimentacaoDeEstorno(LancamentoModel lancamento)
    {
        if (lancamento.ContaBancariaId <= 0)
            throw new InvalidOperationException(
                "Lançamento inválido para registrar movimentação de estorno."
            );

        var movimentacao = new MovimentacaoBancaria
        {
            DataMovimentacao = DateTime.Now,
            Valor = lancamento.Valor,
            Historico = $"ESTORNO: {lancamento.Descricao}",
            ContaBancariaId = lancamento.ContaBancariaId,
            UsuarioId = lancamento.UsuarioId,
            Lancamento = lancamento,
        };

        var conta =
            await context.ContasBancarias.FindAsync(lancamento.ContaBancariaId)
            ?? throw new KeyNotFoundException(
                $"Conta bancária ID {lancamento.ContaBancariaId} não encontrada."
            );

        if (lancamento.Tipo == TipoLancamento.Receita)
        {
            movimentacao.TipoMovimentacao = TipoMovimentacao.Saida;
            conta.Saldo -= lancamento.Valor;
        }
        else
        {
            movimentacao.TipoMovimentacao = TipoMovimentacao.Entrada;
            conta.Saldo += lancamento.Valor;
        }

        await context.MovimentacoesBancarias.AddAsync(movimentacao);
        context.ContasBancarias.Update(conta);
    }
}
