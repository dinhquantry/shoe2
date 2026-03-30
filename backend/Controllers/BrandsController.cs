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
    public class BrandsController : ControllerBase
    {
        private readonly IBrandService _brandService;
        public BrandsController(IBrandService brandService) => _brandService = brandService;

        // 1. LẤY DANH SÁCH 
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _brandService.GetBrandsAsync();
            return Ok(new { success = true, data = brands });
        }

        // 2. LẤY CHI TIẾT THEO ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _brandService.GetBrandByIdAsync(id);
            if (brand == null) return this.NotFoundError("Không tìm thấy thương hiệu", "brand_not_found");
            return Ok(new { success = true, data = brand });
        }

        // 3. THÊM MỚI 
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(BrandCreateDto dto)
        {
            var brand = new Brand
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Description = dto.Description,
                IsActive = dto.IsActive
            };

            var result = await _brandService.CreateBrandAsync(brand);
            return CreatedAtAction(nameof(GetById), new { id = result.Id },
                new { success = true, message = "Thêm thành công", data = result });
        }

        // 4. CẬP NHẬT 
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, BrandUpdateDto dto)
        {
            var brand = new Brand
            {
                Name = dto.Name,
                Slug = dto.Slug,
                Description = dto.Description,
                IsActive = dto.IsActive
            };

            var updated = await _brandService.UpdateBrandAsync(id, brand);
            if (!updated) return this.NotFoundError("Không tìm thấy thương hiệu", "brand_not_found");

            return Ok(new { success = true, message = "Cập nhật thành công" });
        }

        // 5. XÓA (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _brandService.DeleteBrandAsync(id);
            if (!deleted) return this.NotFoundError("Không tìm thấy thương hiệu để xóa", "brand_not_found");

            return Ok(new { success = true, message = "Xóa thành công" });
        }
    }
}