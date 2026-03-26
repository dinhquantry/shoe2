using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<User?> Register(RegisterDto registerDto);
        Task<string?> Login(LoginDto loginDto);
    }
}