using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services;

public class GeminiService : IGeminiService
{
    private const int MaxRecursiveCalls = 3;
    private const int MaxHistoryMessages = 10; // Limita o histórico a 5 pares de pergunta/resposta
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;
    private readonly IAgentActionService _actionService;

    public GeminiService(IHttpClientFactory httpClientFactory, IAgentActionService actionService)
    {
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
        _apiKey =
            Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException(
                "A chave da API do Gemini (GEMINI_API_KEY) não foi configurada no arquivo .env."
            );
        _apiUrl =
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
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
            {
                // Resposta final de texto, sem chamada de função.
                return firstPart["text"]?.GetValue<string>() ?? "Ação concluída.";
            }

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
}
