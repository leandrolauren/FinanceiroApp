using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Services
{
    public class LancamentoService : ILancamentoService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMovimentacaoBancariaService _movimentacaoService;

        public LancamentoService(
            ApplicationDbContext context,
            IMovimentacaoBancariaService movimentacaoService
        )
        {
            _context = context;
            _movimentacaoService = movimentacaoService;
        }

        public async Task<LancamentoModel> CreateLancamentoAsync(CriarLancamentoDto dto, int userId)
        {
            var planoContaEhPai = await _context.PlanosContas.AnyAsync(p =>
                p.PlanoContasPaiId == dto.PlanoContasId && p.UsuarioId == userId
            );

            if (planoContaEhPai)
            {
                throw new InvalidOperationException(
                    "Não é possível lançar em um Plano de Contas que possui filhos."
                );
            }

            if (dto.Pago && (!dto.ContaBancariaId.HasValue || dto.ContaBancariaId.Value <= 0))
            {
                throw new InvalidOperationException(
                    "Para um lançamento ser salvo como 'Pago', é obrigatório selecionar uma Conta Bancária."
                );
            }

            if (dto.Pago && !dto.DataPagamento.HasValue)
            {
                throw new InvalidOperationException(
                    "Para um lançamento ser salvo como 'Pago', a Data de Pagamento é obrigatória."
                );
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            var lancamento = new LancamentoModel
            {
                Descricao = dto.Descricao,
                Tipo = dto.Tipo.ToUpper() == "R" ? TipoLancamento.Receita : TipoLancamento.Despesa,
                Valor = dto.Valor,
                DataCompetencia = dto.DataCompetencia,
                DataVencimento = dto.DataVencimento,
                DataPagamento = dto.DataPagamento,
                Pago = dto.Pago,
                ContaBancariaId = dto.ContaBancariaId,
                PlanoContaId = dto.PlanoContasId,
                PessoaId = dto.PessoaId,
                UsuarioId = userId,
                DataLancamento = DateTime.Now,
            };
            _context.Lancamentos.Add(lancamento);

            if (lancamento.Pago && lancamento.ContaBancariaId.HasValue)
            {
                await _movimentacaoService.RegistrarMovimentacaoDePagamento(lancamento);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return lancamento;
        }
    }
}
