using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FinanceiroApp.Services;

public class RelatorioDocument : IDocument
{
    private readonly RelatorioFinanceiroDados _dados;
    private readonly byte[] _logoData;

    public RelatorioDocument(RelatorioFinanceiroDados model, byte[] logoData)
    {
        _dados = model;
        _logoData = logoData;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Margin(50);

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);

            page.Footer()
                .AlignCenter()
                .Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
        });
    }

    void ComposeHeader(IContainer container)
    {
        var titleStyle = TextStyle.Default.FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);

        container.Row(row =>
        {
            row.RelativeItem()
                .Column(column =>
                {
                    column
                        .Item()
                        .ShowOnce()
                        .Column(textColumn =>
                        {
                            textColumn.Item().Text("Relatório Financeiro").Style(titleStyle);
                            textColumn
                                .Item()
                                .Text(
                                    $"Período: {_dados.DataInicio:dd/MM/yyyy} a {_dados.DataFim:dd/MM/yyyy}"
                                );
                            textColumn.Item().Text($"Status: {_dados.StatusFiltro}");
                            textColumn.Item().Text($"Gerado para: {_dados.NomeUsuario}");
                        });
                });
            row.ConstantItem(40).AlignRight().Image(_logoData);
        });
    }

    void ComposeContent(IContainer container)
    {
        container
            .PaddingVertical(40)
            .Column(column =>
            {
                column.Spacing(20);

                // KPIs
                column
                    .Item()
                    .Row(row =>
                    {
                        row.RelativeItem()
                            .Border(1)
                            .Background(Colors.Grey.Lighten4)
                            .Padding(10)
                            .Column(c =>
                            {
                                c.Item().Text("Receitas").SemiBold();
                                c.Item()
                                    .Text($"{_dados.Kpis.TotalReceitas:C}")
                                    .FontColor(Colors.Green.Medium)
                                    .Bold();
                            });
                        row.Spacing(10);
                        row.RelativeItem()
                            .Border(1)
                            .Background(Colors.Grey.Lighten4)
                            .Padding(10)
                            .Column(c =>
                            {
                                c.Item().Text("Despesas").SemiBold();
                                c.Item()
                                    .Text($"{_dados.Kpis.TotalDespesas:C}")
                                    .FontColor(Colors.Red.Medium)
                                    .Bold();
                            });
                        row.Spacing(10);
                        row.RelativeItem()
                            .Border(1)
                            .Background(Colors.Grey.Lighten2)
                            .Padding(10)
                            .Column(c =>
                            {
                                c.Item().Text("Saldo").SemiBold();
                                c.Item()
                                    .Text($"{_dados.Kpis.Saldo:C}")
                                    .FontColor(
                                        _dados.Kpis.Saldo >= 0
                                            ? Colors.Blue.Medium
                                            : Colors.Red.Darken2
                                    )
                                    .Bold();
                            });
                    });

                // Lançamentos
                column.Item().Element(ComposeTable);

                // Saldos
                column.Item().Element(ComposeSaldos);
            });
    }

    void ComposeTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
            });

            table.Header(header =>
            {
                header.Cell().Element(HeaderCellStyle).Text("Descrição");
                header.Cell().Element(HeaderCellStyle).Text("Pessoa");
                header.Cell().Element(HeaderCellStyle).Text("Categoria");
                header.Cell().Element(HeaderCellStyle).AlignRight().Text("Vencimento");
                header.Cell().Element(HeaderCellStyle).AlignRight().Text("Valor");

                static IContainer HeaderCellStyle(IContainer c) =>
                    c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5);
            });

            static IContainer BodyCellStyle(IContainer c) =>
                c.BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).PaddingVertical(5);

            foreach (var lancamento in _dados.Lancamentos)
            {
                table.Cell().Element(BodyCellStyle).Text(lancamento.Descricao);
                table.Cell().Element(BodyCellStyle).Text(lancamento.Pessoa?.Nome);
                table.Cell().Element(BodyCellStyle).Text(lancamento.PlanoContas?.Descricao);
                table
                    .Cell()
                    .Element(BodyCellStyle)
                    .AlignRight()
                    .Text($"{lancamento.DataVencimento:dd/MM/yy}");
                table
                    .Cell()
                    .Element(BodyCellStyle)
                    .AlignRight()
                    .Text($"{lancamento.Valor:C}")
                    .FontColor(
                        lancamento.Tipo == TipoLancamento.Receita.ToString()
                            ? Colors.Green.Medium
                            : Colors.Red.Medium
                    );
            }
        });
    }

    void ComposeSaldos(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().Text("Saldos das Contas Bancárias").FontSize(14).SemiBold();
            foreach (var conta in _dados.SaldosContas)
            {
                column.Item().Text($"{conta.NomeConta}: {conta.SaldoAtual:C}");
            }
        });
    }
}
