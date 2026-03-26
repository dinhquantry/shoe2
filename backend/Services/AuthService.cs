using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public AuthService(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }
        public async Task<User?> Register(RegisterDto registerDto)
        {
            // 1. Kiểm tra email đã tồn tại chưa 
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return null;

            // 2. Hash mật khẩu (Sử dụng BCrypt) 
            string salt = BCrypt.Net.BCrypt.GenerateSalt(12);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password, salt);

            // 3. Tạo User mới
            var user = new User
            {
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                PasswordHash = hashedPassword, // Không lưu mật khẩu gốc 
                Phone = registerDto.Phone ?? "",
                Role = 0, // Mặc định là Khách hàng 
                Status = 1 // Đang hoạt động 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
        public async Task<string?> Login(LoginDto loginDto)
        {
            // 1. Tìm user theo Email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null) return null;

            // 2. Kiểm tra mật khẩu (So sánh hash)
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;

            // 3. Nếu OK, tạo JWT Token
            return CreateToken(user);
        }

        private string CreateToken(User user)
        {
            // Tạo danh sách các đặc điểm của User (Claims)
            var claims = new List<Claim>
    {
        new Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email, user.Email),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, user.Role == 1 ? "Admin" : "User")
    };

            // Tạo chìa khóa bí mật từ TokenKey trong appsettings.json
            var tokenKey = _config["TokenKey"] ?? throw new InvalidOperationException("TokenKey is not configured");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Mô tả cấu trúc của Token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}