using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface ICouponService
    {
        Task<IEnumerable<Coupon>> GetAllCouponsAsync();
        Task<Coupon?> GetCouponByIdAsync(int id);
        Task<Coupon> CreateCouponAsync(CouponCreateUpdateDto dto);
        Task<bool> UpdateCouponAsync(int id, CouponCreateUpdateDto dto);
        Task<bool> SoftDeleteCouponAsync(int id);
        Task<Coupon?> ValidateCouponAsync(string code, decimal cartTotal, int userId);
        Task<bool> RecordCouponUsageAsync(int couponId, int userId, int orderId);
    }
}
