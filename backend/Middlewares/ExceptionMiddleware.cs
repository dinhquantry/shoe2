using System.Text.Json;

namespace backend.Middlewares
{
    public sealed class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Unhandled exception while processing request {Path}", context.Request.Path);

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var payload = new
                {
                    success = false,
                    message = "An unexpected server error occurred.",
                    error = new
                    {
                        code = "server_error"
                    }
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
        }
    }
}
