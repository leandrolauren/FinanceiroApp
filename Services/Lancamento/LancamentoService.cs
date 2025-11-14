using System.Linq;
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

            if (dto.Parcelado && dto.Pago)
            {
                throw new InvalidOperationException(
                    "Não é possível marcar um lançamento parcelado como pago ao cadastrá-lo."
                );
            }

            if (!dto.Parcelado)
            {
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
            }

            if (dto.Parcelado)
            {
                ValidarParcelamento(dto);
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            var tipoLancamento =
                dto.Tipo.ToUpper() == "R" ? TipoLancamento.Receita : TipoLancamento.Despesa;

            LancamentoModel lancamento;

            if (dto.Parcelado)
            {
                lancamento = CriarParcelas(dto, userId, tipoLancamento);
            }
            else
            {
                lancamento = CriarLancamentoSimples(dto, userId, tipoLancamento);

                if (lancamento.Pago && lancamento.ContaBancariaId.HasValue)
                {
                    await _movimentacaoService.RegistrarMovimentacaoDePagamento(lancamento);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return lancamento;
        }

        private void ValidarParcelamento(CriarLancamentoDto dto)
        {
            if (dto.Parcelas == null || dto.Parcelas.Count == 0)
            {
                throw new InvalidOperationException(
                    "Informe ao menos duas parcelas para criar um lançamento parcelado."
                );
            }

            if (dto.Parcelas.Count < 2)
            {
                throw new InvalidOperationException(
                    "Um lançamento parcelado deve possuir no mínimo duas parcelas."
                );
            }

            var somaParcelas = dto.Parcelas.Sum(p => p.Valor);
            var diferenca = Math.Abs(somaParcelas - dto.Valor);

            if (diferenca > 0.01m)
            {
                throw new InvalidOperationException(
                    "A soma dos valores das parcelas deve ser igual ao valor total informado."
                );
            }

            if (
                dto.Parcelas.Any(p =>
                    p.DataCompetencia == default || p.DataVencimento == default || p.Valor <= 0
                )
            )
            {
                throw new InvalidOperationException(
                    "Todas as parcelas devem possuir valor e datas válidas."
                );
            }
        }

        private LancamentoModel CriarLancamentoSimples(
            CriarLancamentoDto dto,
            int userId,
            TipoLancamento tipoLancamento
        )
        {
            var lancamento = new LancamentoModel
            {
                Descricao = dto.Descricao,
                Tipo = tipoLancamento,
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
            return lancamento;
        }

        private LancamentoModel CriarParcelas(
            CriarLancamentoDto dto,
            int userId,
            TipoLancamento tipoLancamento
        )
        {
            var parcelasOrdenadas = dto.Parcelas!
                .OrderBy(p => p.Numero == 0 ? int.MaxValue : p.Numero)
                .ThenBy(p => p.DataVencimento)
                .ToList();

            LancamentoModel? primeiraParcela = null;

            for (var i = 0; i < parcelasOrdenadas.Count; i++)
            {
                var parcelaDto = parcelasOrdenadas[i];
                var descricaoParcela =
                    string.IsNullOrWhiteSpace(dto.Descricao)
                        ? $"Parcela {i + 1}/{parcelasOrdenadas.Count}"
                        : $"{dto.Descricao} ({i + 1}/{parcelasOrdenadas.Count})";

                var novaParcela = new LancamentoModel
                {
                    Descricao = descricaoParcela,
                    Tipo = tipoLancamento,
                    Valor = parcelaDto.Valor,
                    DataCompetencia = parcelaDto.DataCompetencia,
                    DataVencimento = parcelaDto.DataVencimento,
                    DataPagamento = parcelaDto.DataPagamento,
                    Pago = parcelaDto.DataPagamento.HasValue,
                    ContaBancariaId = dto.ContaBancariaId,
                    PlanoContaId = dto.PlanoContasId,
                    PessoaId = dto.PessoaId,
                    UsuarioId = userId,
                    DataLancamento = DateTime.Now,
                };

                if (primeiraParcela != null)
                {
                    novaParcela.LancamentoPai = primeiraParcela;
                }

                _context.Lancamentos.Add(novaParcela);

                if (primeiraParcela == null)
                {
                    primeiraParcela = novaParcela;
                }
            }

            return primeiraParcela!;
        }
    }
}
