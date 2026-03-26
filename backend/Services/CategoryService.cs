using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IGenericRepository<Category> _repo;
        private readonly ApplicationDbContext _context; // Cần dùng để xử lý Include đệ quy

        public CategoryService(IGenericRepository<Category> repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        // Lấy danh sách phẳng (dùng cho Admin quản lý)
        public async Task<IEnumerable<Category>> GetAllAsync()
            => await _repo.GetAllAsync();

        // Lấy danh sách chi tiết theo ID
        public async Task<Category?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        // Lấy cấu trúc cây (dùng cho Menu hiển thị)
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
                // Tìm các danh mục con có ParentId trùng với Id của danh mục hiện tại
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

            // LẤY DANH MỤC GỐC: Ta tìm ở Key = 0 thay vì null
            return categoriesByParent.TryGetValue(0, out var rootCategories)
                ? rootCategories.Select(BuildNode)
                : Enumerable.Empty<CategoryTreeDto>();
        }

        public async Task<Category> CreateAsync(Category category)
        {
            await _repo.AddAsync(category);
            await _repo.SaveChangesAsync();
            return category;
        }

        public async Task<bool> UpdateAsync(int id, Category category)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Name = category.Name;
            existing.Slug = category.Slug;
            existing.Description = category.Description;
            existing.ParentId = category.ParentId; // Hỗ trợ đổi danh mục cha 
            existing.IsActive = category.IsActive;

            _repo.Update(existing);
            return await _repo.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null) return false;

            // Kiểm tra xem có danh mục con không trước khi xóa (Ràng buộc logic)
            var hasChildren = await _context.Categories.AnyAsync(c => c.ParentId == id);
            if (hasChildren) throw new InvalidOperationException("Không thể xóa danh mục đang có danh mục con.");

            _repo.Delete(category);
            return await _repo.SaveChangesAsync();
        }
    }
}