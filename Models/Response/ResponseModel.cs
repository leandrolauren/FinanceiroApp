namespace FinanceiroApp.Models
{
    public class ResponseModel<T>
    {
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public int StatusCode { get; set; } = 200;
        public List<String> Errors { get; set; } = [];
    }
}
