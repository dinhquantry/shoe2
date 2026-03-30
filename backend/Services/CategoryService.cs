using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
            => await _context.Categories.AsNoTracking().ToListAsync();

        public async Task<Category?> GetByIdAsync(int id)
            => await _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        public async Task<IEnumerable<CategoryTreeDto>> GetTreeAsync()
        {
            var allCategories = await _context.Categories
                .AsNoTracking()
                .ToListAsync();

            var categoriesByParent = allCategories
                .GroupBy(c => c.ParentId ?? 0)
                .ToDictionary(g => g.Key, g => g.ToList());

            CategoryTreeDto BuildNode(Category category)
            {
                var children = categoriesByParent.TryGetValue(category.Id, out var childCategories)
                    ? childCategories.Select(BuildNode).ToList()
                    : new List<CategoryTreeDto>();

                return new CategoryTreeDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Slug = category.Slug,
                    IsActive = category.IsActive,
                    Children = children
                };
            }

            return categoriesByParent.TryGetValue(0, out var rootCategories)
                ? rootCategories.Select(BuildNode)
                : Enumerable.Empty<CategoryTreeDto>();
        }

        public async Task<Category> CreateAsync(Category category)
        {
            if (category.ParentId.HasValue)
            {
                var parentExists = await _context.Categories
                    .AnyAsync(c => c.Id == category.ParentId.Value);

                if (!parentExists)
                {
                    throw new InvalidOperationException("Danh muc cha khong ton tai.");
                }
            }

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> UpdateAsync(int id, Category category)
        {
            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (existing == null) return false;

            if (category.ParentId == id)
            {
                throw new InvalidOperationException("Danh muc khong the tu lam danh muc cha cua chinh no.");
            }

            if (category.ParentId.HasValue)
            {
                var parentExists = await _context.Categories
                    .AnyAsync(c => c.Id == category.ParentId.Value);

                if (!parentExists)
                {
                    throw new InvalidOperationException("Danh muc cha khong ton tai.");
                }
            }

            existing.Name = category.Name;
            existing.Slug = category.Slug;
            existing.Description = category.Description;
            existing.ParentId = category.ParentId;
            existing.IsActive = category.IsActive;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return false;

            var hasChildren = await _context.Categories.AnyAsync(c => c.ParentId == id);
            if (hasChildren)
            {
                throw new InvalidOperationException("Khong the xoa danh muc dang co danh muc con.");
            }

            var deletedAt = DateTime.UtcNow;
            category.SoftDelete(deletedAt);
            await SoftDeleteCascadeHelper.SoftDeleteProductGraphAsync(
                _context,
                _context.Products.Where(product => product.CategoryId == id),
                deletedAt);

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
