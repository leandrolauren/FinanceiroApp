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
                    GetCriarLancamentoDespesaTool(),
                    GetCriarPessoaTool(),
                    GetExcluirPessoaTool(),
                    GetConsultarSaldoContaBancariaTool(),
                },
            };
        }

        private static JsonObject GetCriarLancamentoDespesaTool()
        {
            return new JsonObject
            {
                ["name"] = "criar_lancamento_despesa",
                ["description"] = "Cria um novo lançamento de despesa no sistema financeiro.",
                ["parameters"] = new JsonObject
                {
                    ["type"] = "OBJECT",
                    ["properties"] = new JsonObject
                    {
                        ["descricao"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] = "A descrição do lançamento. Ex: 'Compras do mês'",
                        },
                        ["valor"] = new JsonObject
                        {
                            ["type"] = "NUMBER",
                            ["description"] = "O valor da despesa.",
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
                                "O nome da pessoa ou empresa para quem a despesa se destina. Ex: 'Supermercado XYZ'",
                        },
                        ["nomePlanoContas"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "A categoria da despesa. Ex: 'Alimentação', 'Moradia'",
                        },
                        ["dataPagamento"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "Opcional. A data de pagamento no formato AAAA-MM-DD. Se fornecida, o lançamento é criado como 'Pago'.",
                        },
                        ["nomeContaBancaria"] = new JsonObject
                        {
                            ["type"] = "STRING",
                            ["description"] =
                                "Opcional. O nome da conta bancária usada para o pagamento. Obrigatório se a dataPagamento for fornecida.",
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
    }
}
