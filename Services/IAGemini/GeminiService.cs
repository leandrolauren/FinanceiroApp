using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FinanceiroApp.Services;

public class GeminiService : IGeminiService
{
    private const int MaxRecursiveCalls = 3;
    private const int MaxHistoryMessages = 10; // Limita o histórico a 5 pares de pergunta/resposta
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<GeminiService> _logger;
    private readonly IAgentActionService _actionService;

    public GeminiService(
        IHttpClientFactory httpClientFactory,
        IAgentActionService actionService,
        ApplicationDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ILogger<GeminiService> logger
    )
    {
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
        _apiKey =
            Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException(
                "A chave da API do Gemini (GEMINI_API_KEY) não foi configurada no arquivo .env."
            );
        _apiUrl =
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        _actionService = actionService;
    }

    public async Task<string> GenerateContentAsync(string userMessage, List<ChatMessageDto> history)
    {
        int callCount = 0;

        var systemInstruction = new
        {
            role = "user",
            parts = new[] { new { text = SystemContextPrompt.Prompt } },
        };
        var modelGreeting = new
        {
            role = "model",
            parts = new[] { new { text = "Olá! Eu sou o Galo Jhon. Como posso te ajudar?" } },
        };

        var contents = new List<object> { systemInstruction, modelGreeting };

        // Pega apenas as últimas N mensagens para economizar tokens
        var recentHistory = history.TakeLast(MaxHistoryMessages);
        foreach (var message in recentHistory)
        {
            contents.Add(
                new { role = message.Role, parts = new[] { new { text = message.Text } } }
            );
        }

        contents.Add(new { role = "user", parts = new[] { new { text = userMessage } } });

        while (callCount < MaxRecursiveCalls)
        {
            var payload = new JsonObject
            {
                ["contents"] = JsonSerializer.SerializeToNode(contents),
                ["tools"] = new JsonArray { GeminiToolDefinitions.GetTools() },
                ["generationConfig"] = new JsonObject
                {
                    ["temperature"] = 0.7,
                    ["topK"] = 1,
                    ["topP"] = 1,
                    ["maxOutputTokens"] = 2048,
                },
            };

            var jsonPayload = payload.ToJsonString();
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_apiUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Erro na API do Gemini: {response.StatusCode}. Detalhes: {errorContent}"
                );
            }

            var jsonResponse = JsonNode.Parse(await response.Content.ReadAsStringAsync());

            var firstCandidate = jsonResponse?["candidates"]?[0];
            if (firstCandidate == null)
                return "Não foi possível obter uma resposta.";

            var firstPart = firstCandidate["content"]?["parts"]?[0];
            if (firstPart == null)
                return "Não foi possível obter uma resposta.";

            var functionCall = firstPart["functionCall"];

            if (functionCall == null)
                return firstPart["text"]?.GetValue<string>() ?? "Ação concluída.";

            callCount++;

            var modelResponseWithFunctionCall = JsonSerializer.Deserialize<object>(
                firstCandidate["content"]!.ToJsonString()
            );
            contents.Add(modelResponseWithFunctionCall);

            var functionName = functionCall["name"]?.GetValue<string>();
            var args = functionCall["args"] as JsonObject;
            var functionResult = await ExecuteFunction(functionName, args);

            var functionResponsePart = new
            {
                functionResponse = new
                {
                    name = functionName,
                    response = new { name = functionName, content = functionResult },
                },
            };
            contents.Add(new { parts = new[] { functionResponsePart } });
        }

        return "Ocorreu um erro ao processar as ações solicitadas.";
    }

    public async Task<List<AiCategorizedTransactionDto>> CategorizeTransactionsAsync(
        List<OfxTransactionDto> transactions
    )
    {
        var userId = GetUserId();

        var allPlanoContas = await _context
            .PlanosContas.Where(p => p.UsuarioId == userId)
            .AsNoTracking()
            .ToListAsync();

        var parentIds = new HashSet<int>(
            allPlanoContas
                .Where(p => p.PlanoContasPaiId.HasValue)
                .Select(p => p.PlanoContasPaiId!.Value)
        );

        var leafPlanoContas = allPlanoContas.Where(p => !parentIds.Contains(p.Id));

        var planosReceita = leafPlanoContas
            .Where(p => p.Tipo == Models.MovimentoTipo.Receita)
            .Select(p => $"  - ID {p.Id}: {p.Descricao}")
            .ToList();

        var planosDespesa = leafPlanoContas
            .Where(p => p.Tipo == Models.MovimentoTipo.Despesa)
            .Select(p => $"  - ID {p.Id}: {p.Descricao}")
            .ToList();

        var receitasToCategorize = transactions.Where(t => t.Amount >= 0).ToList();
        var despesasToCategorize = transactions.Where(t => t.Amount < 0).ToList();

        var finalResult = new List<AiCategorizedTransactionDto>();

        if (receitasToCategorize.Any() && planosReceita.Any())
        {
            var resultReceitas = await CallAiForCategorization(
                "Receita",
                string.Join("\n", planosReceita),
                receitasToCategorize
            );
            finalResult.AddRange(resultReceitas);
        }

        if (despesasToCategorize.Any() && planosDespesa.Any())
        {
            var resultDespesas = await CallAiForCategorization(
                "Despesa",
                string.Join("\n", planosDespesa),
                despesasToCategorize
            );
            finalResult.AddRange(resultDespesas);
        }

        var categorizedFitIds = new HashSet<string>(finalResult.Select(r => r.FitId));
        var uncategorizedTransactions = transactions.Where(t =>
            !categorizedFitIds.Contains(t.FitId)
        );
        foreach (var trx in uncategorizedTransactions)
        {
            finalResult.Add(
                new AiCategorizedTransactionDto { FitId = trx.FitId, PlanoContasId = null }
            );
        }

        return finalResult;
    }

    private async Task<List<AiCategorizedTransactionDto>> CallAiForCategorization(
        string tipoMovimento,
        string listaPlanosContas,
        List<OfxTransactionDto> transactions
    )
    {
        var transactionsToCategorize = transactions.Select(t => new
        {
            fitId = t.FitId,
            description = t.Description,
            amount = t.Amount,
        });

        var serializerOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        };

        var prompt =
            $@"
Você é um assistente financeiro especialista em categorização. Sua tarefa é analisar uma lista de transações bancárias de '{tipoMovimento}' e associar cada uma ao plano de contas mais apropriado da lista fornecida.

Regras:
1. Analise a 'description' de cada transação para determinar a categoria mais adequada.
2. Você DEVE retornar a resposta em um formato JSON válido, que é um array de objetos, um para CADA transação de entrada.
3. Cada objeto no array de saída DEVE ter duas chaves: 'fitId' (copiado EXATAMENTE da transação original) e 'planoContasId' (o ID do plano de contas que você escolheu).
4. Se você não conseguir determinar uma categoria com confiança para uma transação, o valor de 'planoContasId' deve ser null, mas o 'fitId' ainda deve ser retornado.

**Exemplo de como processar:**
Se a entrada for:
[
  {{
    ""fitId"": ""67890"",
    ""description"": ""COMPRA SUPERMERCADO ABC"",
    ""amount"": -150.25
  }}
]
E os planos de contas de '{tipoMovimento}' forem:
- ID 101: Alimentação
- ID 105: Moradia

A sua saída JSON DEVE ser:
[
  {{
    ""fitId"": ""67890"",
    ""planoContasId"": 101
  }}
]

**Agora, processe os dados reais abaixo:**

LISTA DE PLANOS DE CONTAS DE {tipoMovimento.ToUpper()} (ID: Descrição):
{listaPlanosContas}

TRANSAÇÕES PARA CATEGORIZAR:
{JsonSerializer.Serialize(transactionsToCategorize, serializerOptions)}

Retorne APENAS o array JSON. Não inclua a palavra 'json' ou os marcadores ``` no início ou no fim da sua resposta.
";

        _logger.LogInformation(
            "Prompt enviado para a IA para categorização de {TipoMovimento}: {Prompt}",
            tipoMovimento,
            prompt
        );

        var payload = new JsonObject
        {
            ["contents"] = new JsonArray
            {
                new JsonObject
                {
                    ["parts"] = new JsonArray { new JsonObject { ["text"] = prompt } },
                },
            },
            ["generationConfig"] = new JsonObject
            {
                ["response_mime_type"] = "application/json",
                ["temperature"] = 0.2,
            },
        };

        var jsonPayload = payload.ToJsonString();
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(_apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError(
                "Erro na API do Gemini: {StatusCode}. Detalhes: {ErrorContent}",
                response.StatusCode,
                errorContent
            );
            throw new HttpRequestException(
                $"Erro na API do Gemini: {response.StatusCode}. Detalhes: {errorContent}"
            );
        }

        var jsonResponse = JsonNode.Parse(await response.Content.ReadAsStringAsync());
        var responseText = jsonResponse?["candidates"]?[0]?["content"]?["parts"]?[0]?[
            "text"
        ]?.GetValue<string>();

        _logger.LogInformation(
            "Resposta JSON crua da IA para {TipoMovimento}: {ResponseText}",
            tipoMovimento,
            responseText
        );

        if (string.IsNullOrWhiteSpace(responseText))
        {
            _logger.LogWarning(
                "A IA não retornou uma resposta vazia ou nula para {TipoMovimento}.",
                tipoMovimento
            );
            return transactions
                .Select(t => new AiCategorizedTransactionDto
                {
                    FitId = t.FitId,
                    PlanoContasId = null,
                })
                .ToList();
        }

        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var categorizedResult = JsonSerializer.Deserialize<List<AiCategorizedTransactionDto>>(
                responseText,
                options
            );
            _logger.LogInformation(
                "Resultado da deserialização para {TipoMovimento}: {Count} itens categorizados.",
                tipoMovimento,
                categorizedResult?.Count ?? 0
            );
            return categorizedResult ?? new List<AiCategorizedTransactionDto>();
        }
        catch (JsonException jsonEx)
        {
            _logger.LogError(
                jsonEx,
                "Erro ao deserializar a resposta da IA para {TipoMovimento}. Resposta recebida: {ResponseText}",
                tipoMovimento,
                responseText
            );
            throw new InvalidOperationException(
                $"A IA retornou um JSON em formato inválido para {tipoMovimento}.",
                jsonEx
            );
        }
    }

    private async Task<AgentActionResult> ExecuteFunction(string? name, JsonObject? args)
    {
        if (string.IsNullOrWhiteSpace(name) || args == null)
            return new AgentActionResult
            {
                Success = false,
                Message = "Nome da função ou argumentos inválidos.",
            };

        try
        {
            switch (name)
            {
                case "criar_lancamento_despesa":
                    return await _actionService.CriarLancamentoDespesa(
                        descricao: args["descricao"]!.GetValue<string>(),
                        valor: args["valor"]!.GetValue<decimal>(),
                        dataVencimento: args["dataVencimento"]!.GetValue<DateTime>(),
                        nomePessoa: args["nomePessoa"]!.GetValue<string>(),
                        nomePlanoContas: args["nomePlanoContas"]!.GetValue<string>(),
                        dataPagamento: args.TryGetPropertyValue("dataPagamento", out var dp)
                            ? dp?.GetValue<DateTime>()
                            : null,
                        nomeContaBancaria: args.TryGetPropertyValue(
                            "nomeContaBancaria",
                            out var ncb
                        )
                            ? ncb?.GetValue<string>()
                            : null
                    );

                case "criar_pessoa":
                    return await _actionService.CriarPessoa(
                        nome: args["nome"]!.GetValue<string>(),
                        email: args.TryGetPropertyValue("email", out var em)
                            ? em?.GetValue<string>()
                            : null,
                        cpf: args.TryGetPropertyValue("cpf", out var cpf)
                            ? cpf?.GetValue<string>()
                            : null,
                        cnpj: args.TryGetPropertyValue("cnpj", out var cnpj)
                            ? cnpj?.GetValue<string>()
                            : null,
                        confirmado: args.TryGetPropertyValue("confirmado", out var c)
                            && c!.GetValue<bool>()
                    );

                case "excluir_pessoa":
                    return await _actionService.ExcluirPessoa(
                        nomePessoa: args["nomePessoa"]!.GetValue<string>(),
                        confirmado: args.TryGetPropertyValue("confirmado", out var confirmNode)
                            && confirmNode!.GetValue<bool>()
                    );

                case "consultar_saldo_conta_bancaria":
                    return await _actionService.ConsultarSaldoContaBancaria(
                        nomeContaBancaria: args["nomeContaBancaria"]!.GetValue<string>()
                    );

                default:
                    return new AgentActionResult
                    {
                        Success = false,
                        Message = $"A função '{name}' não foi encontrada.",
                    };
            }
        }
        catch (Exception ex)
        {
            return new AgentActionResult
            {
                Success = false,
                Message = $"Ocorreu um erro ao executar a função '{name}': {ex.Message}",
            };
        }
    }

    private int GetUserId()
    {
        var userClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userClaim != null && int.TryParse(userClaim.Value, out int userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Usuário não pode ser identificado.");
    }
}
