using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CouponService : ICouponService
    {
        private readonly ApplicationDbContext _context;
        public CouponService(ApplicationDbContext context) => _context = context;

        // Dành cho Admin tạo mã mới
        public async Task<Coupon> CreateCouponAsync(CouponCreateUpdateDto dto)
        {
            var existing = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code);
            if (existing != null) throw new Exception("Mã giảm giá này đã tồn tại.");

            var coupon = new Coupon
            {
                Code = dto.Code,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MinOrderValue = dto.MinOrderValue,
                MaxDiscountValue = dto.MaxDiscountValue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                UsedCount = 0
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();
            return coupon;
        }

        // Dành cho lúc khách hàng nhập mã ở trang Checkout
        public async Task<Coupon?> ValidateCouponAsync(string code, decimal cartTotal)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);
            
            if (coupon == null) throw new Exception("Mã giảm giá không tồn tại.");
            if (DateTime.Now < coupon.StartDate || DateTime.Now > coupon.EndDate) 
                throw new Exception("Mã giảm giá chưa đến hạn hoặc đã hết hạn.");
            if (coupon.UsedCount >= coupon.UsageLimit) 
                throw new Exception("Mã giảm giá đã hết lượt sử dụng.");
            if (cartTotal < coupon.MinOrderValue) 
                throw new Exception($"Đơn hàng phải từ {coupon.MinOrderValue:N0}đ để áp dụng mã này.");

            return coupon;
        }

        // Tự động gọi hàm này bên trong OrderService sau khi lưu Order thành công
        public async Task<bool> RecordCouponUsageAsync(int couponId)
        {
            var coupon = await _context.Coupons.FindAsync(couponId);
            if (coupon == null) return false;

            coupon.UsedCount += 1;
            _context.Coupons.Update(coupon);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}