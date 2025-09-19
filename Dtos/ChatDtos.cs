namespace FinanceiroApp.Dtos
{
    public class ChatRequestDto
    {
        public required string Message { get; set; }
    }

    public class ChatResponseDto
    {
        public required string Response { get; set; }
    }

    public class ChatMessageDto
    {
        public required string Role { get; set; } // "user" or "model"
        public required string Text { get; set; }
    }
}