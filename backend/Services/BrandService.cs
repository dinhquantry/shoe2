using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class BrandService : IBrandService
    {
        private readonly IGenericRepository<Brand> _repo;
        public BrandService(IGenericRepository<Brand> repo) => _repo = repo;
        public async Task<IEnumerable<Brand>> GetBrandsAsync() => await _repo.GetAllAsync();
        public async Task<Brand?> GetBrandByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Brand> CreateBrandAsync(Brand brand)
        {
            await _repo.AddAsync(brand);
            await _repo.SaveChangesAsync();
            return brand;
        }
        public async Task<bool> UpdateBrandAsync(int id, Brand brand)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return false;
            existing.Name = brand.Name;
            existing.Slug = brand.Slug;
            existing.Description = brand.Description;
            existing.IsActive = brand.IsActive;
            _repo.Update(existing);
            return await _repo.SaveChangesAsync();
        }
        public async Task<bool> DeleteBrandAsync(int id)
        {
            var brand = await _repo.GetByIdAsync(id);
            if (brand == null) return false;
            _repo.Delete(brand);
            return await _repo.SaveChangesAsync();
        }
    }
}