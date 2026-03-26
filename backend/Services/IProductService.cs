using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IProductService
    {
        // Nhớ đổi thành ProductCreateDto ở đây
        Task<Product> CreateProductWithVariantsAsync(ProductCreateDto dto); 
        
        Task<object> GetProductsAsync(string? search, int? categoryId, int page = 1, int pageSize = 10);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto);
        Task<bool> DeleteProductAsync(int id);
    }
}