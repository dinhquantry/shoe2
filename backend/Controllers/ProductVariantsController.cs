using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class ProductVariantsController : ControllerBase
    {
        private readonly IProductVariantService _variantService;

        public ProductVariantsController(IProductVariantService variantService)
        {
            _variantService = variantService;
        }

        [HttpPost]
        public async Task<IActionResult> AddVariant([FromBody] VariantAddDto dto)
        {
            try
            {
                var result = await _variantService.AddVariantAsync(dto);
                return Ok(new { success = true, message = "Thêm biến thể thành công", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVariant(int id, [FromBody] VariantUpdateDto dto)
        {
            var result = await _variantService.UpdateVariantAsync(id, dto);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy biến thể" });

            return Ok(new { success = true, message = "Cập nhật tồn kho/giá thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVariant(int id)
        {
            var result = await _variantService.DeleteVariantAsync(id);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy biến thể" });

            return Ok(new { success = true, message = "Đã xóa biến thể" });
        }
    }
}