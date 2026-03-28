using backend.DTOs;

namespace backend.Services
{
    public interface IProductImageService
    {
        Task<List<ProductImageDto>> GetImagesByProductIdAsync(int productId);
        Task<List<ProductImageDto>> UploadImagesAsync(MultipleImageUploadDto dto);
        Task<bool> SetMainImageAsync(int imageId);
        Task<bool> DeleteImageAsync(int imageId);
    }
}
