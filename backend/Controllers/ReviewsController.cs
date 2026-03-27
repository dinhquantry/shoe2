using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId)) return userId;
            throw new UnauthorizedAccessException("Không thể xác định danh tính.");
        }

        // 1. NGƯỜI DÙNG: VIẾT ĐÁNH GIÁ
        [HttpPost]
        [Authorize] // Bắt buộc đăng nhập
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var review = await _reviewService.AddReviewAsync(userId, dto);
                
                return Ok(new { 
                    success = true, 
                    message = "Đánh giá của bạn đã được gửi thành công và đang chờ quản trị viên duyệt.",
                    data = review
                });
            }
            catch (Exception ex)
            {
                // Bắt các lỗi như: Chưa mua hàng, hoặc đã đánh giá rồi
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // 2. ADMIN: DUYỆT ĐÁNH GIÁ (Cho phép hiển thị lên web)
        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới có quyền duyệt
        public async Task<IActionResult> ApproveReview(int id)
        {
            var result = await _reviewService.ApproveReviewAsync(id);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy bài đánh giá này." });
            
            return Ok(new { success = true, message = "Đã duyệt! Bài đánh giá sẽ được hiển thị trên trang sản phẩm." });
        }
    }
}