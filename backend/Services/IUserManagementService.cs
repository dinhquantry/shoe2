using backend.DTOs;

namespace backend.Services
{
    public interface IUserManagementService
    {
        Task<IEnumerable<UserAdminDto>> GetUsersAsync(string? search = null);
        Task<UserAdminDto?> GetUserByIdAsync(int id);
        Task<bool> UpdateUserAsync(int id, UserAdminUpdateDto dto);
    }
}
