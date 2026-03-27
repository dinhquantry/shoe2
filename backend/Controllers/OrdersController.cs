using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Phải đăng nhập mới được mua hàng
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId)) return userId;
            throw new UnauthorizedAccessException("Không xác định được danh tính.");
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var order = await _orderService.PlaceOrderAsync(userId, dto);
                
                return Ok(new { 
                    success = true, 
                    message = "Đặt hàng thành công!", 
                    data = new { OrderCode = order.OrderCode, TotalAmount = order.TotalAmount }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}