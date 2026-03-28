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

        [HttpGet("tree")]
        public async Task<IActionResult> GetTree()
        {
            var tree = await _categoryService.GetTreeAsync();
            return Ok(new { success = true, data = tree });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CategoryCreateDto dto)
        {
            try
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
            catch (InvalidOperationException ex)
            {
                return this.BadRequestError(ex.Message, "category_invalid_parent");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CategoryUpdateDto dto)
        {
            try
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
                if (!updated) return this.NotFoundError("Khong tim thay danh muc", "category_not_found");

                return Ok(new { success = true, message = "Cap nhat thanh cong" });
            }
            catch (InvalidOperationException ex)
            {
                return this.BadRequestError(ex.Message, "category_invalid_parent");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _categoryService.DeleteAsync(id);
                if (!deleted) return this.NotFoundError("Khong tim thay danh muc", "category_not_found");

                return Ok(new { success = true, message = "Da xoa" });
            }
            catch (InvalidOperationException ex)
            {
                return this.BadRequestError(ex.Message, "category_has_children");
            }
        }
    }
}
