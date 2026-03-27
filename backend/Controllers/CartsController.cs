using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Phải có token đăng nhập mới dùng được API này
    public class CartsController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartsController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // Hàm tiện ích: Trích xuất ID của User đang đăng nhập từ JWT Token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId)) return userId;
            throw new UnauthorizedAccessException("Không thể xác định danh tính.");
        }

        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            int userId = GetCurrentUserId();
            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(new { success = true, data = cart });
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                await _cartService.AddItemToCartAsync(userId, dto);
                return Ok(new { success = true, message = "Đã thêm vào giỏ hàng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("update-quantity/{cartItemId}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] int quantity)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, quantity);
                if (!result) return NotFound(new { success = false, message = "Không tìm thấy món hàng trong giỏ." });
                
                return Ok(new { success = true, message = "Cập nhật số lượng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            int userId = GetCurrentUserId();
            var result = await _cartService.RemoveItemFromCartAsync(userId, cartItemId);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy món hàng trong giỏ." });
            
            return Ok(new { success = true, message = "Đã xóa khỏi giỏ hàng." });
        }
    }
}