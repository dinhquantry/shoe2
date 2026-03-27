using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;
        public ReviewService(ApplicationDbContext context) => _context = context;

        public async Task<Review> AddReviewAsync(int userId, ReviewCreateDto dto)
        {
            var hasPurchased = await (from o in _context.Orders
                          join oi in _context.OrderItems on o.Id equals oi.OrderId
                          join pv in _context.ProductVariants on oi.ProductVariantId equals pv.Id
                          where o.UserId == userId 
                             && o.OrderStatus == 3 // Đã hoàn thành
                             && pv.ProductId == dto.ProductId // Trùng mã sản phẩm gốc
                          select o.Id).AnyAsync();

            if (!hasPurchased) throw new Exception("Bạn phải mua và nhận hàng thành công mới được đánh giá.");

            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                IsApproved = false // Chống spam, chờ Admin duyệt
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<bool> ApproveReviewAsync(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null) return false;

            review.IsApproved = true;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}