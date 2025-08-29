using System;
using System.Collections.Generic;
using FinanceiroApp.Models;

namespace FinanceiroApp.Dtos
{
    // DTO para os cartões de KPIs
    public class KpiDto
    {
        public decimal TotalReceitas { get; set; }
        public decimal TotalDespesas { get; set; }
        public decimal Saldo { get; set; }
    }

    // DTO para o gráfico de Top Despesas
    public class CategoriaTotalDto
    {
        public string Categoria { get; set; }
        public decimal Total { get; set; }
    }

    // DTO para as listas de Contas a Pagar/Receber
    public class LancamentoResumoDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
    }
        public class GraficoEntradaSaidaDto
    {
        public List<string> Meses { get; set; } = new List<string>();
        public List<decimal> Receitas { get; set; } = new List<decimal>();
        public List<decimal> Despesas { get; set; } = new List<decimal>();
    }

    public enum StatusLancamentoFiltro
    {
        Todos,
        Pago,
        Aberto,
    }

    public class ContasProximasDto
    {
        public List<LancamentoResumoDto> ContasAPagar { get; set; } = new();
        public List<LancamentoResumoDto> ContasAReceber { get; set; } = new();
    }

    // DTO para o gráfico de Evolução de Saldo
    public class EvolucaoSaldoDto
    {
        public List<string> Datas { get; set; } = new();
        public List<decimal> Saldos { get; set; } = new();
    }

    // DTO para a lista de Saldos em Contas Bancárias
    public class SaldoContaBancariaDto
    {
        public string NomeConta { get; set; }
        public decimal SaldoAtual { get; set; }
    }
}