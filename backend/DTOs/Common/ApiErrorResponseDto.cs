namespace backend.DTOs
{
    public class ApiErrorResponseDto
    {
        public bool Success { get; set; } = false;
        public ApiErrorDto Error { get; set; } = new();

        public static ApiErrorResponseDto Create(string code, string message, object? details = null)
        {
            return new ApiErrorResponseDto
            {
                Error = new ApiErrorDto
                {
                    Code = code,
                    Message = message,
                    Details = details
                }
            };
        }
    }

    public class ApiErrorDto
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Details { get; set; }
    }
}