using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId)) return userId;
            throw new UnauthorizedAccessException("Khong xac dinh duoc danh tinh.");
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCoupons()
        {
            var coupons = await _couponService.GetAllCouponsAsync();
            return Ok(new { success = true, data = coupons });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCouponById(int id)
        {
            var coupon = await _couponService.GetCouponByIdAsync(id);
            if (coupon == null)
            {
                return NotFound(new { success = false, message = "Khong tim thay ma giam gia" });
            }

            return Ok(new { success = true, data = coupon });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCoupon([FromBody] CouponCreateUpdateDto dto)
        {
            try
            {
                var coupon = await _couponService.CreateCouponAsync(dto);
                return Ok(new { success = true, message = "Tao ma giam gia thanh cong", data = coupon });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCoupon(int id, [FromBody] CouponCreateUpdateDto dto)
        {
            try
            {
                var updated = await _couponService.UpdateCouponAsync(id, dto);
                if (!updated)
                {
                    return NotFound(new { success = false, message = "Khong tim thay ma giam gia" });
                }

                return Ok(new { success = true, message = "Cap nhat ma giam gia thanh cong" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDeleteCoupon(int id)
        {
            var deleted = await _couponService.SoftDeleteCouponAsync(id);
            if (!deleted)
            {
                return NotFound(new { success = false, message = "Khong tim thay ma giam gia" });
            }

            return Ok(new { success = true, message = "Da xoa mem ma giam gia" });
        }

        [HttpGet("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateCoupon([FromQuery] string code, [FromQuery] decimal cartTotal)
        {
            try
            {
                var userId = GetCurrentUserId();
                var coupon = await _couponService.ValidateCouponAsync(code, cartTotal, userId);
                return Ok(new
                {
                    success = true,
                    message = "Ma giam gia hop le!",
                    data = new
                    {
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
