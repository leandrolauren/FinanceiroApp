using System.Text;
using System.Text.Json;
using FinanceiroApp.Dtos;

namespace FinanceiroApp.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    public GeminiService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
        _apiKey =
            Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? throw new InvalidOperationException(
                "A chave da API do Gemini (GEMINI_API_KEY) não foi configurada no arquivo .env."
            );
        _apiUrl =
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={_apiKey}";
    }

    public async Task<string> GenerateContentAsync(string userMessage, List<ChatMessageDto> history)
    {
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

        foreach (var message in history)
        {
            contents.Add(
                new { role = message.Role, parts = new[] { new { text = message.Text } } }
            );
        }

        contents.Add(new { role = "user", parts = new[] { new { text = userMessage } } });

        var payload = new
        {
            contents,
            generationConfig = new
            {
                temperature = 0.7,
                topK = 1,
                topP = 1,
                maxOutputTokens = 2048,
            },
        };

        var jsonPayload = JsonSerializer.Serialize(payload);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(_apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(
                $"Erro na API do Gemini: {response.StatusCode}. Detalhes: {errorContent}"
            );
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(jsonResponse);
        var modelResponse = doc
            .RootElement.GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return modelResponse ?? "Não foi possível obter uma resposta.";
    }
}
