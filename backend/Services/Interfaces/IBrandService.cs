using backend.Models;

namespace backend.Services
{
    public interface IBrandService
    {
        Task<IEnumerable<Brand>> GetBrandsAsync();
        Task<Brand?> GetBrandByIdAsync(int id);
        Task<Brand> CreateBrandAsync(Brand brand);
        Task<bool> UpdateBrandAsync(int id, Brand brand);
        Task<bool> DeleteBrandAsync(int id);
    }
}