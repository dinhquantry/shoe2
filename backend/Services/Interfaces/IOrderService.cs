using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IOrderService
    {
        Task<Order> PlaceOrderAsync(int userId, CheckoutDto dto);
    }
}