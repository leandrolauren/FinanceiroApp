using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

namespace FinanceiroApp.Services;

public class RelatorioFinanceiroService : IRelatorioFinanceiroService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IHttpClientFactory _httpClientFactory;

    public RelatorioFinanceiroService(
        ApplicationDbContext context,
        IWebHostEnvironment webHostEnvironment,
        IHttpClientFactory httpClientFactory
    )
    {
        _context = context;
        _webHostEnvironment = webHostEnvironment;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<byte[]> GerarRelatorioPdfAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        string status
    )
    {
        var dados = await GerarDadosRelatorioAsync(usuarioId, dataInicio, dataFim, status);
        var logoData = await GetLogoBytesAsync();
        var document = new RelatorioDocument(dados, logoData);
        return document.GeneratePdf();
    }

    public async Task<RelatorioFinanceiroDados> GerarDadosRelatorioAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        string status
    )
    {
        if (!Enum.TryParse<StatusLancamentoFiltro>(status, true, out var statusFiltro))
        {
            statusFiltro = StatusLancamentoFiltro.Todos;
        }

        IQueryable<LancamentoModel> queryBase = _context
            .Lancamentos.AsNoTracking()
            .Where(l => l.UsuarioId == usuarioId);

        IQueryable<LancamentoModel> queryFiltrada = FiltrarPorPeriodo(
            queryBase,
            statusFiltro,
            dataInicio,
            dataFim
        );

        var kpis = new KpiDto
        {
            TotalReceitas = await queryFiltrada
                .Where(l => l.Tipo == TipoLancamento.Receita)
                .SumAsync(l => l.Valor),
            TotalDespesas = await queryFiltrada
                .Where(l => l.Tipo == TipoLancamento.Despesa)
                .SumAsync(l => l.Valor),
        };
        kpis.Saldo = kpis.TotalReceitas - kpis.TotalDespesas;

        var topDespesas = await queryFiltrada
            .Where(l => l.Tipo == TipoLancamento.Despesa)
            .Include(l => l.PlanoContas)
            .GroupBy(l => l.PlanoContas!.Descricao)
            .Select(g => new CategoriaTotalDto { Categoria = g.Key, Total = g.Sum(l => l.Valor) })
            .OrderByDescending(d => d.Total)
            .Take(5)
            .ToListAsync();

        var topReceitas = await queryFiltrada
            .Where(l => l.Tipo == TipoLancamento.Receita)
            .Include(l => l.PlanoContas)
            .GroupBy(l => l.PlanoContas!.Descricao)
            .Select(g => new CategoriaTotalDto { Categoria = g.Key, Total = g.Sum(l => l.Valor) })
            .OrderByDescending(d => d.Total)
            .Take(5)
            .ToListAsync();

        var todosLancamentos = await queryFiltrada
            .Include(l => l.Pessoa)
            .Include(l => l.PlanoContas)
            .OrderBy(l => l.DataVencimento)
            .Select(l => new LancamentoRelatorioDto
            {
                Id = l.Id,
                Descricao = l.Descricao,
                Tipo = l.Tipo.ToString(),
                Valor = l.Valor,
                DataVencimento = l.DataVencimento,
                Pago = l.Pago,
                Pessoa =
                    l.Pessoa != null
                        ? new PessoaSimplificadaDto { Id = l.Pessoa.Id, Nome = l.Pessoa.Nome }
                        : null,
                PlanoContas =
                    l.PlanoContas != null
                        ? new PlanoContasSimplificadoDto
                        {
                            Id = l.PlanoContas.Id,
                            Descricao = l.PlanoContas.Descricao,
                        }
                        : null,
            })
            .ToListAsync();

        var saldosContas = await _context
            .ContasBancarias.AsNoTracking()
            .Where(c => c.UsuarioId == usuarioId && c.Ativa)
            .Select(c => new SaldoContaBancariaDto
            {
                NomeConta = c.Descricao,
                SaldoAtual = c.Saldo,
            })
            .ToListAsync();

        var usuario = await _context.Usuarios.AsNoTracking().FirstAsync(u => u.Id == usuarioId);

        return new RelatorioFinanceiroDados
        {
            NomeUsuario = usuario.Nome,
            DataInicio = dataInicio,
            DataFim = dataFim,
            StatusFiltro = statusFiltro.ToString(),
            Kpis = kpis,
            TopDespesas = topDespesas,
            TopReceitas = topReceitas,
            Lancamentos = todosLancamentos,
            SaldosContas = saldosContas,
        };
    }

    public async Task<ExtratoCategoriaDados> GerarDadosExtratoCategoriaAsync(
        int usuarioId,
        DateTime dataInicio,
        DateTime dataFim,
        int planoContaId,
        string status
    )
    {
        if (!Enum.TryParse<StatusLancamentoFiltro>(status, true, out var statusFiltro))
        {
            statusFiltro = StatusLancamentoFiltro.Todos;
        }

        var planoConta =
            await _context
                .PlanosContas.AsNoTracking()
                .FirstOrDefaultAsync(pc => pc.Id == planoContaId && pc.UsuarioId == usuarioId)
            ?? throw new KeyNotFoundException("Plano de contas não encontrado.");

        var descendantIds = await GetAllDescendantIdsAsync(planoContaId, usuarioId);
        var allCategoryIds = new List<int> { planoContaId }
            .Concat(descendantIds)
            .ToList();

        IQueryable<LancamentoModel> queryBase = _context
            .Lancamentos.AsNoTracking()
            .Where(l => l.UsuarioId == usuarioId && allCategoryIds.Contains(l.PlanoContaId));

        IQueryable<LancamentoModel> queryFiltrada = FiltrarPorPeriodo(
            queryBase,
            statusFiltro,
            dataInicio,
            dataFim
        );

        var totalCategoria = await queryFiltrada.SumAsync(l =>
            l.Tipo == TipoLancamento.Receita ? l.Valor : -l.Valor
        );

        var lancamentos = await queryFiltrada
            .Include(l => l.Pessoa)
            .OrderBy(l => l.DataVencimento)
            .Select(l => new LancamentoRelatorioDto
            {
                Id = l.Id,
                Descricao = l.Descricao,
                Tipo = l.Tipo.ToString(),
                Valor = l.Valor,
                DataVencimento = l.DataVencimento,
                Pago = l.Pago,
                Pessoa =
                    l.Pessoa != null
                        ? new PessoaSimplificadaDto { Id = l.Pessoa.Id, Nome = l.Pessoa.Nome }
                        : null,
                PlanoContas = new PlanoContasSimplificadoDto
                {
                    Id = l.PlanoContas.Id,
                    Descricao = l.PlanoContas.Descricao,
                },
            })
            .ToListAsync();

        var usuario = await _context.Usuarios.AsNoTracking().FirstAsync(u => u.Id == usuarioId);

        return new ExtratoCategoriaDados
        {
            NomeUsuario = usuario.Nome,
            NomeCategoria = planoConta.Descricao,
            DataInicio = dataInicio,
            DataFim = dataFim,
            StatusFiltro = statusFiltro.ToString(),
            TotalCategoria = totalCategoria,
            Lancamentos = lancamentos,
        };
    }

    private static IQueryable<LancamentoModel> FiltrarPorPeriodo(
        IQueryable<LancamentoModel> query,
        StatusLancamentoFiltro status,
        DateTime dataInicio,
        DateTime dataFim
    )
    {
        dataInicio = DateTime.SpecifyKind(dataInicio, DateTimeKind.Unspecified);
        dataFim = DateTime.SpecifyKind(dataFim, DateTimeKind.Unspecified);

        return status switch
        {
            StatusLancamentoFiltro.Pago => query.Where(l =>
                l.Pago && l.DataPagamento >= dataInicio && l.DataPagamento <= dataFim
            ),
            StatusLancamentoFiltro.Aberto => query.Where(l =>
                !l.Pago && l.DataVencimento >= dataInicio && l.DataVencimento <= dataFim
            ),
            _ => query.Where(l => l.DataCompetencia >= dataInicio && l.DataCompetencia <= dataFim),
        };
    }

    private async Task<byte[]> GetLogoBytesAsync()
    {
        const string logoUrl = "https://i.imgur.com/42QmCee.png";
        using var httpClient = _httpClientFactory.CreateClient();
        return await httpClient.GetByteArrayAsync(logoUrl);
    }

    private async Task<List<int>> GetAllDescendantIdsAsync(int parentId, int userId)
    {
        var descendentes = new List<int>();
        var filhos = await _context
            .PlanosContas.Where(p => p.PlanoContasPaiId == parentId && p.UsuarioId == userId)
            .Select(p => p.Id)
            .ToListAsync();

        if (filhos.Count == 0)
            return descendentes;

        descendentes.AddRange(filhos);

        foreach (var filhoId in filhos)
            descendentes.AddRange(await GetAllDescendantIdsAsync(filhoId, userId));

        return descendentes;
    }
}
