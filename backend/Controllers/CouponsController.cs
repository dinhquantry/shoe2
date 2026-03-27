using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponsController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        // 1. ADMIN: TẠO MÃ GIẢM GIÁ MỚI
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCoupon([FromBody] CouponCreateUpdateDto dto)
        {
            try
            {
                var coupon = await _couponService.CreateCouponAsync(dto);
                return Ok(new { success = true, message = "Tạo mã giảm giá thành công", data = coupon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // 2. NGƯỜI DÙNG: KIỂM TRA MÃ GIẢM GIÁ (Lúc ở trang Giỏ hàng / Thanh toán)
        [HttpGet("validate")]
        [Authorize] // Người dùng phải đăng nhập mới được xài mã
        public async Task<IActionResult> ValidateCoupon([FromQuery] string code, [FromQuery] decimal cartTotal)
        {
            try
            {
                var coupon = await _couponService.ValidateCouponAsync(code, cartTotal);
                return Ok(new { 
                    success = true, 
                    message = "Mã giảm giá hợp lệ!", 
                    data = new {
                        Code = coupon!.Code,
                        DiscountType = coupon.DiscountType,
                        DiscountValue = coupon.DiscountValue,
                        MaxDiscountValue = coupon.MaxDiscountValue
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}