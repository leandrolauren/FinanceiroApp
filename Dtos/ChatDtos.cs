namespace FinanceiroApp.Dtos;

public class ChatRequestDto
{
    public required string Message { get; set; }
    public List<ChatMessageDto> History { get; set; } = new();
}

public class ChatResponseDto
{
    public required string Response { get; set; }
}

public class ChatMessageDto
{
    public required string Role { get; set; }
    public required string Text { get; set; }
}
