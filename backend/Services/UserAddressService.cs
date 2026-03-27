using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserAddressService : IUserAddressService
    {
        private readonly ApplicationDbContext _context;
        public UserAddressService(ApplicationDbContext context) => _context = context;

        public async Task<List<UserAddress>> GetUserAddressesAsync(int userId)
        {
            return await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault) // Mặc định hiện lên đầu
                .ToListAsync();
        }

        public async Task<UserAddress> AddAddressAsync(int userId, AddressCreateUpdateDto dto)
        {
            if (dto.IsDefault)
            {
                var oldDefaults = await _context.UserAddresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync();
                foreach (var addr in oldDefaults) addr.IsDefault = false;
            }

            bool hasAddress = await _context.UserAddresses.AnyAsync(a => a.UserId == userId);
            if (!hasAddress) dto.IsDefault = true;

            var newAddress = new UserAddress
            {
                UserId = userId,
                ReceiverName = dto.ReceiverName,
                ReceiverPhone = dto.ReceiverPhone,
                Province = dto.Province,
                Ward = dto.Ward,
                DetailAddress = dto.DetailAddress,
                IsDefault = dto.IsDefault
            };

            _context.UserAddresses.Add(newAddress);
            await _context.SaveChangesAsync();
            return newAddress;
        }

        public async Task<bool> DeleteAddressAsync(int userId, int addressId)
        {
            var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);
            if (address == null) return false;

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}