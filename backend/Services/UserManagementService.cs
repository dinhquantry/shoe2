using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;

        public UserManagementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserAdminDto>> GetUsersAsync(string? search = null)
        {
            var query = _context.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim();
                query = query.Where(user =>
                    user.FullName.Contains(normalizedSearch) ||
                    user.Email.Contains(normalizedSearch) ||
                    user.Phone.Contains(normalizedSearch));
            }

            return await query
                .OrderByDescending(user => user.CreatedAt)
                .Select(user => new UserAdminDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role,
                    Status = user.Status,
                    AvatarUrl = user.AvatarUrl,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<UserAdminDto?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(user => user.Id == id)
                .Select(user => new UserAdminDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Role = user.Role,
                    Status = user.Status,
                    AvatarUrl = user.AvatarUrl,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateUserAsync(int id, UserAdminUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            if (user.Role != 0)
            {
                throw new Exception("Chi duoc cap nhat trang thai cua tai khoan khach hang.");
            }

            user.Status = dto.Status;
            user.UpdatedAt = DateTime.Now;

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
