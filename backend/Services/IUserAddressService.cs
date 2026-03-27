using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IUserAddressService
    {
        Task<List<UserAddress>> GetUserAddressesAsync(int userId);
        Task<UserAddress> AddAddressAsync(int userId, AddressCreateUpdateDto dto);
        Task<bool> DeleteAddressAsync(int userId, int addressId);
    }
}