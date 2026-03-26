using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IProductImageService
    {
        Task<List<ProductImage>> UploadImagesAsync(MultipleImageUploadDto dto); // Trả về 1 list ảnh        
        Task<bool> DeleteImageAsync(int imageId);
    }
}