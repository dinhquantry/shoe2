using backend.DTOs;
using backend.Extensions;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoryService) => _categoryService = categoryService;

        // Lấy dạng cây để hiện Menu
        [HttpGet("tree")]
        public async Task<IActionResult> GetTree()
        {
            var tree = await _categoryService.GetTreeAsync();
            return Ok(new { success = true, data = tree });
        }

        // THÊM MỚI 
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CategoryCreateDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Description = dto.Description,
                ParentId = dto.ParentId,
                IsActive = dto.IsActive
            };

            var created = await _categoryService.CreateAsync(category);
            return Ok(new { success = true, data = created });
        }

        // CẬP NHẬT
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CategoryUpdateDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Description = dto.Description,
                ParentId = dto.ParentId,
                IsActive = dto.IsActive
            };

            var updated = await _categoryService.UpdateAsync(id, category);
            if (!updated) return this.NotFoundError("Không tìm thấy danh mục", "category_not_found");

            return Ok(new { success = true, message = "Cập nhật thành công" });
        }

        // XÓA
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _categoryService.DeleteAsync(id);
                if (!deleted) return this.NotFoundError("Không tìm thấy danh mục", "category_not_found");
                return Ok(new { success = true, message = "Đã xóa" });
            }
            catch (InvalidOperationException ex)
            {
                return this.BadRequestError(ex.Message, "category_has_children");
            }
        }
    }
}