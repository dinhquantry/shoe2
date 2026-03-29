using backend.DTOs;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService) => _authService = authService;

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var user = await _authService.Register(registerDto);

            if (user == null)
            {
                return this.BadRequestError("Email đã tồn tại!", "email_exists");
            }

            return Ok(new
            {
                success = true,
                message = "Đăng ký thành công!",
                data = new { user.Id, user.Email, user.FullName }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var token = await _authService.Login(loginDto);

            if (token == null)
            {
                return this.UnauthorizedError(
                    "Email hoặc mật khẩu không chính xác!",
                    "invalid_credentials"
                );
            }

            return Ok(new
            {
                success = true,
                message = "Đăng nhập thành công!",
                token
            });
        }
    }
}
