using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IProductVariantService
    {
        Task<ProductVariant?> AddVariantAsync(VariantAddDto dto);
        Task<bool> UpdateVariantAsync(int id, VariantUpdateDto dto);
        Task<bool> DeleteVariantAsync(int id);
    }
}