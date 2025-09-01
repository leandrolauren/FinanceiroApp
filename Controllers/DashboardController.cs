using System.Globalization;
using System.Security.Claims;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("entradas-e-saidas")]
        public async Task<IActionResult> GetEntradasESaidas(
            [FromQuery] DateTime dataInicio,
            [FromQuery] DateTime dataFim,
            [FromQuery] StatusLancamentoFiltro status = StatusLancamentoFiltro.Todos
        )
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            dataInicio = DateTime.SpecifyKind(dataInicio, DateTimeKind.Unspecified);
            dataFim = DateTime.SpecifyKind(dataFim, DateTimeKind.Unspecified);

            var query = _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && l.DataCompetencia.Date >= dataInicio.Date
                    && l.DataCompetencia.Date <= dataFim.Date
                );

            switch (status)
            {
                case StatusLancamentoFiltro.Pago:
                    query = query.Where(l => l.Pago);
                    break;
                case StatusLancamentoFiltro.Aberto:
                    query = query.Where(l => !l.Pago);
                    break;
            }

            var aggregatedData = await query
                .GroupBy(l => new
                {
                    l.DataCompetencia.Year,
                    l.DataCompetencia.Month,
                    l.Tipo,
                })
                .Select(g => new
                {
                    Ano = g.Key.Year,
                    Mes = g.Key.Month,
                    Tipo = g.Key.Tipo,
                    Total = g.Sum(l => l.Valor),
                })
                .ToListAsync();

            var response = new GraficoEntradaSaidaDto();
            var culture = new CultureInfo("pt-BR");

            for (var dt = dataInicio; dt <= dataFim; dt = dt.AddMonths(1))
            {
                response.Meses.Add(dt.ToString("MMM/yy", culture));

                var receitaDoMes =
                    aggregatedData
                        .FirstOrDefault(d =>
                            d.Ano == dt.Year
                            && d.Mes == dt.Month
                            && (int)d.Tipo == (int)MovimentoTipo.Receita
                        )
                        ?.Total ?? 0;
                response.Receitas.Add(receitaDoMes);

                var despesaDoMes =
                    aggregatedData
                        .FirstOrDefault(d =>
                            d.Ano == dt.Year
                            && d.Mes == dt.Month
                            && (int)d.Tipo == (int)MovimentoTipo.Despesa
                        )
                        ?.Total ?? 0;

                response.Despesas.Add(-despesaDoMes);
            }

            return Ok(response);
        }

        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis(
            [FromQuery] DateTime dataInicio,
            [FromQuery] DateTime dataFim,
            [FromQuery] StatusLancamentoFiltro status = StatusLancamentoFiltro.Todos
        )
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var query = _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && l.DataCompetencia.Date >= dataInicio.Date
                    && l.DataCompetencia.Date <= dataFim.Date
                );

            switch (status)
            {
                case StatusLancamentoFiltro.Pago:
                    query = query.Where(l => l.Pago);
                    break;
                case StatusLancamentoFiltro.Aberto:
                    query = query.Where(l => !l.Pago);
                    break;
            }

            var receitas = await query
                .Where(l => (int)l.Tipo == (int)MovimentoTipo.Receita)
                .SumAsync(l => l.Valor);
            var despesas = await query
                .Where(l => (int)l.Tipo == (int)MovimentoTipo.Despesa)
                .SumAsync(l => l.Valor);

            return Ok(
                new KpiDto
                {
                    TotalReceitas = receitas,
                    TotalDespesas = despesas,
                    Saldo = receitas - despesas,
                }
            );
        }

        [HttpGet("top-despesas")]
        public async Task<IActionResult> GetTopDespesas(
            [FromQuery] DateTime dataInicio,
            [FromQuery] DateTime dataFim,
            [FromQuery] StatusLancamentoFiltro status = StatusLancamentoFiltro.Todos
        )
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var query = _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && (int)l.Tipo == (int)MovimentoTipo.Despesa
                    && l.DataCompetencia.Date >= dataInicio.Date
                    && l.DataCompetencia.Date <= dataFim.Date
                );

            switch (status)
            {
                case StatusLancamentoFiltro.Pago:
                    query = query.Where(l => l.Pago);
                    break;
                case StatusLancamentoFiltro.Aberto:
                    query = query.Where(l => !l.Pago);
                    break;
            }

            var topDespesas = await query
                .Include(l => l.PlanoContas)
                .GroupBy(l => l.PlanoContas.Descricao)
                .Select(g => new CategoriaTotalDto
                {
                    Categoria = g.Key,
                    Total = g.Sum(l => l.Valor),
                })
                .OrderByDescending(d => d.Total)
                .Take(5)
                .ToListAsync();

            return Ok(topDespesas);
        }

        [HttpGet("contas-proximas")]
        public async Task<IActionResult> GetContasProximas(
            [FromQuery] DateTime dataInicio,
            [FromQuery] DateTime dataFim
        )
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var query = _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && !l.Pago
                    && l.DataVencimento.Date >= dataInicio.Date
                    && l.DataVencimento.Date <= dataFim.Date
                );

            var aPagar = await query
                .Where(l => (int)l.Tipo == (int)MovimentoTipo.Despesa)
                .OrderBy(l => l.DataVencimento)
                .Take(5)
                .Select(l => new LancamentoResumoDto
                {
                    Id = l.Id,
                    Descricao = l.Descricao,
                    Valor = l.Valor,
                    DataVencimento = l.DataVencimento,
                })
                .ToListAsync();

            var aReceber = await query
                .Where(l => (int)l.Tipo == (int)MovimentoTipo.Receita)
                .OrderBy(l => l.DataVencimento)
                .Take(5)
                .Select(l => new LancamentoResumoDto
                {
                    Id = l.Id,
                    Descricao = l.Descricao,
                    Valor = l.Valor,
                    DataVencimento = l.DataVencimento,
                })
                .ToListAsync();

            return Ok(new ContasProximasDto { ContasAPagar = aPagar, ContasAReceber = aReceber });
        }

        [HttpGet("evolucao-saldo")]
        public async Task<IActionResult> GetEvolucaoSaldo(
            [FromQuery] DateTime dataInicio,
            [FromQuery] DateTime dataFim
        )
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var saldoInicial = await _context
                .Lancamentos.AsNoTracking()
                .Where(l => l.UsuarioId == userId && l.Pago && l.DataPagamento < dataInicio)
                .SumAsync(l => (int)l.Tipo == (int)MovimentoTipo.Receita ? l.Valor : -l.Valor);

            var lancamentosNoPeriodo = await _context
                .Lancamentos.AsNoTracking()
                .Where(l =>
                    l.UsuarioId == userId
                    && l.Pago
                    && l.DataPagamento >= dataInicio
                    && l.DataPagamento <= dataFim
                )
                .OrderBy(l => l.DataPagamento)
                .ToListAsync();

            var resultado = new EvolucaoSaldoDto();
            var saldoCorrente = saldoInicial;
            var culture = new CultureInfo("pt-BR");

            for (var dia = dataInicio; dia <= dataFim; dia = dia.AddDays(1))
            {
                resultado.Datas.Add(dia.ToString("dd/MMM", culture));
                var lancamentosDoDia = lancamentosNoPeriodo.Where(l =>
                    l.DataPagamento?.Date == dia.Date
                );
                saldoCorrente += lancamentosDoDia.Sum(l =>
                    (int)l.Tipo == (int)MovimentoTipo.Receita ? l.Valor : -l.Valor
                );
                resultado.Saldos.Add(saldoCorrente);
            }

            return Ok(resultado);
        }

        [HttpGet("saldos-bancarios")]
        public async Task<IActionResult> GetSaldosBancarios()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var saldos = await _context
                .ContasBancarias.AsNoTracking()
                .Where(cb => cb.UsuarioId == userId)
                .Select(cb => new SaldoContaBancariaDto
                {
                    NomeConta = cb.Descricao,
                    SaldoAtual = _context
                        .Lancamentos.Where(l => l.ContaBancariaId == cb.Id && l.Pago)
                        .Sum(l => (int)l.Tipo == (int)MovimentoTipo.Receita ? l.Valor : -l.Valor),
                })
                .ToListAsync();

            return Ok(saldos);
        }
    }
}
