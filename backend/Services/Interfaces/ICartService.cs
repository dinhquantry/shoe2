using backend.DTOs;

namespace backend.Services
{
    public interface ICartService
    {
        Task<CartViewDto> GetCartByUserIdAsync(int userId);
        Task<bool> AddItemToCartAsync(int userId, AddToCartDto dto);
        Task<bool> UpdateCartItemQuantityAsync(int userId, int cartItemId, int quantity);
        Task<bool> RemoveItemFromCartAsync(int userId, int cartItemId);
    }
}