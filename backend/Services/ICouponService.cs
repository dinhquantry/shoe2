using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface ICouponService
    {
        Task<Coupon> CreateCouponAsync(CouponCreateUpdateDto dto);
        Task<Coupon?> ValidateCouponAsync(string code, decimal cartTotal); // Check lúc đặt hàng
        Task<bool> RecordCouponUsageAsync(int couponId); // Tăng biến UsedCount sau khi đặt hàng thành công
    }
}