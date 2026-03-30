using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IReviewService
    {
        Task<Review> AddReviewAsync(int userId, ReviewCreateDto dto);
        Task<bool> ApproveReviewAsync(int reviewId); // Dành cho Admin
    }
}