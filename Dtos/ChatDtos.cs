namespace FinanceiroApp.Dtos;

public class ChatRequestDto
{
    public string Message { get; set; }
    public List<ChatMessageDto> History { get; set; } = new();
}

public class ChatResponseDto
{
    public string Response { get; set; }
}

public class ChatMessageDto
{
    public string Role { get; set; }
    public string Text { get; set; }
}