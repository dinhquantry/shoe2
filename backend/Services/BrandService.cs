using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BrandService : IBrandService
    {
        private readonly ApplicationDbContext _context;

        public BrandService(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Brand>> GetBrandsAsync()
            => await _context.Brands.AsNoTracking().ToListAsync();

        public async Task<Brand?> GetBrandByIdAsync(int id)
            => await _context.Brands.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);

        public async Task<Brand> CreateBrandAsync(Brand brand)
        {
            await _context.Brands.AddAsync(brand);
            await _context.SaveChangesAsync();
            return brand;
        }

        public async Task<bool> UpdateBrandAsync(int id, Brand brand)
        {
            var existing = await _context.Brands.FindAsync(id);
            if (existing == null) return false;

            existing.Name = brand.Name;
            existing.Slug = brand.Slug;
            existing.Description = brand.Description;
            existing.IsActive = brand.IsActive;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteBrandAsync(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return false;

            _context.Brands.Remove(brand);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
