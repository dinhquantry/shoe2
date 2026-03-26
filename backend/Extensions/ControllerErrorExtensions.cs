using backend.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Extensions
{
    public static class ControllerErrorExtensions
    {
        public static IActionResult BadRequestError(this ControllerBase controller, string message, string code = "bad_request", object? details = null)
            => controller.BadRequest(ApiErrorResponseDto.Create(code, message, details));

        public static IActionResult UnauthorizedError(this ControllerBase controller, string message, string code = "unauthorized", object? details = null)
            => controller.Unauthorized(ApiErrorResponseDto.Create(code, message, details));

        public static IActionResult NotFoundError(this ControllerBase controller, string message, string code = "not_found", object? details = null)
            => controller.NotFound(ApiErrorResponseDto.Create(code, message, details));

        public static IActionResult InternalServerError(this ControllerBase controller, string message, string code = "internal_server_error", object? details = null)
            => controller.StatusCode(500, ApiErrorResponseDto.Create(code, message, details));
    }
}