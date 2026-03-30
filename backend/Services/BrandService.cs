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
            var existing = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id);
            if (existing == null) return false;

            existing.Name = brand.Name;
            existing.Slug = brand.Slug;
            existing.Description = brand.Description;
            existing.IsActive = brand.IsActive;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteBrandAsync(int id)
        {
            var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Id == id);
            if (brand == null) return false;

            var deletedAt = DateTime.UtcNow;
            brand.SoftDelete(deletedAt);
            await SoftDeleteCascadeHelper.SoftDeleteProductGraphAsync(
                _context,
                _context.Products.Where(product => product.BrandId == id),
                deletedAt);

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
