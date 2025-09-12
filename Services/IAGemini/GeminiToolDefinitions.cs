using System.Text.Json.Nodes;

namespace FinanceiroApp.Services
{
    public static class GeminiToolDefinitions
    {
        public static JsonObject GetTools()
        {
            return new JsonObject
            {
                ["function_declarations"] = new JsonArray
                {
                    GetCriarLancamentoTool(),
                    GetCriarPessoaTool(),
                    GetExcluirPessoaTool(),
                    GetConsultarSaldoContaBancariaTool(),
                    GetObterResumoFinanceiroTool(),
                },
            };
        }

        private static JsonObject GetCriarLancamentoTool()
        {
            return new JsonObject
            {
                ["name"] = "criar_lancamento",
                ["description"] =
                    "Cria um novo lançamento de receita ou despesa no sistema financeiro.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["descricao"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "A descrição do lançamento. Ex: 'Salário do mês' ou 'Compras do supermercado'",
                        },
                        ["valor"] = new JsonObject
                        {
                            ["type"] = "NUMBER",
                            ["description"] = "O valor da receita ou despesa.",
                        },
                        ["tipo"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "O tipo de lançamento. Use 'R' para receita (entrada de dinheiro) ou 'D' para despesa (saída de dinheiro).",
                        },
                        ["dataVencimento"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "A data de vencimento no formato AAAA-MM-DD.",
                        },
                        ["nomePessoa"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "O nome da pessoa ou empresa relacionada ao lançamento. Ex: 'Empresa Contratante' ou 'Supermercado XYZ'",
                        },
                        ["nomePlanoContas"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "A categoria do lançamento. Ex: 'Salários' para receita, ou 'Alimentação' para despesa.",
                        },
                        ["dataPagamento"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "Opcional. A data de pagamento/recebimento no formato AAAA-MM-DD. Se fornecida, o lançamento é criado como 'Pago'.",
                        },
                        ["nomeContaBancaria"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "Opcional. O nome da conta bancária usada para o pagamento/recebimento. Obrigatório se a dataPagamento for fornecida.",
                        },
                        ["confirmado"] = new JsonObject
                        {
                            ["type"] = "BOOLEAN",
                            ["description"] =
                                "Usado para confirmar a execução da ação após o usuário concordar. Não definir na primeira chamada.",
                        },
                    },
                    ["required"] = new JsonArray
                    {
                        "descricao",
                        "valor",
                        "tipo",
                        "dataVencimento",
                        "nomePessoa",
                        "nomePlanoContas",
                    },
                },
            };
        }

        private static JsonObject GetCriarPessoaTool()
        {
            return new JsonObject
            {
                ["name"] = "criar_pessoa",
                ["description"] = "Cadastra uma nova pessoa (física ou jurídica) no sistema.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["nome"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "O nome completo (para pessoa física) ou a razão social (para pessoa jurídica).",
                        },
                        ["email"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "Opcional. O email da pessoa.",
                        },
                        ["cpf"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "Opcional. O CPF, caso seja pessoa física.",
                        },
                        ["cnpj"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "Opcional. O CNPJ, caso seja pessoa jurídica.",
                        },
                        ["confirmado"] = new JsonObject
                        {
                            ["type"] = "BOOLEAN",
                            ["description"] =
                                "Usado para confirmar a execução da ação após o usuário concordar. Não definir na primeira chamada.",
                        },
                    },
                    ["required"] = new JsonArray { "nome" },
                },
            };
        }

        private static JsonObject GetExcluirPessoaTool()
        {
            return new JsonObject
            {
                ["name"] = "excluir_pessoa",
                ["description"] =
                    "Exclui uma pessoa (física ou jurídica) do sistema. Esta ação é irreversível.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["nomePessoa"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "O nome exato da pessoa a ser excluída.",
                        },
                        ["confirmado"] = new JsonObject
                        {
                            ["type"] = "BOOLEAN",
                            ["description"] =
                                "Usado para confirmar a execução da ação após o usuário concordar. Não definir na primeira chamada.",
                        },
                    },
                    ["required"] = new JsonArray { "nomePessoa" },
                },
            };
        }

        private static JsonObject GetConsultarSaldoContaBancariaTool()
        {
            return new JsonObject
            {
                ["name"] = "consultar_saldo_conta_bancaria",
                ["description"] =
                    "Consulta e retorna o saldo atual de uma conta bancária específica.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["nomeContaBancaria"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "O nome da conta bancária a ser consultada.",
                        },
                    },
                    ["required"] = new JsonArray { "nomeContaBancaria" },
                },
            };
        }

        private static JsonObject GetObterResumoFinanceiroTool()
        {
            return new JsonObject
            {
                ["name"] = "obter_resumo_financeiro",
                ["description"] =
                    "Obtém um resumo da saúde financeira do usuário para um período específico, incluindo totais de receitas, despesas, saldo e as principais categorias de gastos e ganhos. Não precisa de confirmação.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["dataInicio"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "A data de início do período para o resumo, no formato AAAA-MM-DD.",
                        },
                        ["dataFim"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "A data de fim do período para o resumo, no formato AAAA-MM-DD.",
                        },
                        ["status"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "Opcional. Filtra os lançamentos pelo status. Valores possíveis: 'Pago', 'Aberto', 'Todos'. O padrão é 'Todos'.",
                        },
                    },
                    ["required"] = new JsonArray { "dataInicio", "dataFim" },
                },
            };
        }
    }
}
