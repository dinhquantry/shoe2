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

        public async Task<IEnumerable<Coupon>> GetAllCouponsAsync()
            => await _context.Coupons
                .AsNoTracking()
                .OrderByDescending(c => c.Id)
                .ToListAsync();

        public async Task<Coupon?> GetCouponByIdAsync(int id)
            => await _context.Coupons
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Coupon> CreateCouponAsync(CouponCreateUpdateDto dto)
        {
            ValidateCouponInput(dto);

            var existing = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code);
            if (existing != null) throw new Exception("Ma giam gia nay da ton tai.");

            var coupon = new Coupon
            {
                Code = dto.Code,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MinOrderValue = dto.MinOrderValue,
                MaxDiscountValue = dto.MaxDiscountValue,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                UsageLimit = dto.UsageLimit,
                UsedCount = 0
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();
            return coupon;
        }

        public async Task<bool> UpdateCouponAsync(int id, CouponCreateUpdateDto dto)
        {
            ValidateCouponInput(dto);

            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return false;

            var existing = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == dto.Code && c.Id != id);

            if (existing != null) throw new Exception("Ma giam gia nay da ton tai.");

            coupon.Code = dto.Code;
            coupon.DiscountType = dto.DiscountType;
            coupon.DiscountValue = dto.DiscountValue;
            coupon.MinOrderValue = dto.MinOrderValue;
            coupon.MaxDiscountValue = dto.MaxDiscountValue;
            coupon.StartDate = dto.StartDate;
            coupon.EndDate = dto.EndDate;
            coupon.IsActive = dto.IsActive;
            coupon.UsageLimit = dto.UsageLimit;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SoftDeleteCouponAsync(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return false;

            if (!coupon.IsActive) return true;

            coupon.IsActive = false;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Coupon?> ValidateCouponAsync(string code, decimal cartTotal, int userId)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

            if (coupon == null)
                throw new Exception("Ma giam gia khong ton tai.");
            if (!coupon.IsActive)
                throw new Exception("Ma giam gia da bi vo hieu hoa.");
            if (DateTime.Now < coupon.StartDate || DateTime.Now > coupon.EndDate)
                throw new Exception("Ma giam gia chua den han hoac da het han.");
            if (coupon.UsedCount >= coupon.UsageLimit)
                throw new Exception("Ma giam gia da het luot su dung.");
            if (await _context.CouponUsages.AnyAsync(cu => cu.CouponId == coupon.Id && cu.UserId == userId))
                throw new Exception("Ban da su dung ma giam gia nay truoc do.");
            if (cartTotal < coupon.MinOrderValue)
                throw new Exception($"Don hang phai tu {coupon.MinOrderValue:N0}d de ap dung ma nay.");

            return coupon;
        }

        public async Task<bool> RecordCouponUsageAsync(int couponId, int userId, int orderId)
        {
            var transaction = _context.Database.CurrentTransaction;
            var ownsTransaction = transaction == null;

            if (ownsTransaction)
            {
                transaction = await _context.Database.BeginTransactionAsync();
            }

            try
            {
                var coupon = await _context.Coupons.FindAsync(couponId);
                if (coupon == null) return false;

                if (await _context.CouponUsages.AnyAsync(cu => cu.CouponId == couponId && cu.UserId == userId))
                    throw new Exception("Ban da su dung ma giam gia nay truoc do.");

                _context.CouponUsages.Add(new CouponUsage
                {
                    CouponId = couponId,
                    UserId = userId,
                    OrderId = orderId,
                    UsedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                var affectedRows = await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE Coupons SET UsedCount = UsedCount + 1 WHERE Id = {couponId} AND UsedCount < UsageLimit");

                if (affectedRows == 0)
                    throw new Exception("Ma giam gia da het luot su dung.");

                if (ownsTransaction && transaction != null)
                {
                    await transaction.CommitAsync();
                }

                return true;
            }
            catch
            {
                if (ownsTransaction && transaction != null)
                {
                    await transaction.RollbackAsync();
                }

                throw;
            }
            finally
            {
                if (ownsTransaction && transaction != null)
                {
                    await transaction.DisposeAsync();
                }
            }

        }

        private static void ValidateCouponInput(CouponCreateUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
                throw new Exception("Ma giam gia khong duoc de trong.");

            if (dto.EndDate <= dto.StartDate)
                throw new Exception("Ngay ket thuc phai lon hon ngay bat dau.");

            if (dto.DiscountValue <= 0)
                throw new Exception("Gia tri giam phai lon hon 0.");

            if (dto.UsageLimit <= 0)
                throw new Exception("So luot su dung phai lon hon 0.");

            if (dto.MinOrderValue < 0)
                throw new Exception("Gia tri don hang toi thieu khong duoc am.");

            if (dto.MaxDiscountValue < 0)
                throw new Exception("Gia tri giam toi da khong duoc am.");

            if (dto.DiscountType == 0 && dto.DiscountValue > 100)
                throw new Exception("Giam gia theo phan tram khong duoc vuot qua 100.");
        }
    }
}
