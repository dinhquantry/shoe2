using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc phải đăng nhập mới được quản lý địa chỉ
    public class AddressesController : ControllerBase
    {
        private readonly IUserAddressService _addressService;

        public AddressesController(IUserAddressService addressService)
        {
            _addressService = addressService;
        }

        // Lấy ID của User đang đăng nhập từ Token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId)) return userId;
            throw new UnauthorizedAccessException("Không thể xác định danh tính.");
        }

        // 1. LẤY DANH SÁCH ĐỊA CHỈ CỦA TÔI
        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            int userId = GetCurrentUserId();
            var addresses = await _addressService.GetUserAddressesAsync(userId);
            return Ok(new { success = true, data = addresses });
        }

        // 2. THÊM ĐỊA CHỈ MỚI
        [HttpPost]
        public async Task<IActionResult> AddAddress([FromBody] AddressCreateUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var address = await _addressService.AddAddressAsync(userId, dto);
                return Ok(new { success = true, message = "Thêm địa chỉ thành công", data = address });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // 3. XÓA ĐỊA CHỈ
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            int userId = GetCurrentUserId();
            var result = await _addressService.DeleteAddressAsync(userId, id);
            
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy địa chỉ hoặc bạn không có quyền xóa." });
            return Ok(new { success = true, message = "Đã xóa địa chỉ thành công." });
        }
    }
}