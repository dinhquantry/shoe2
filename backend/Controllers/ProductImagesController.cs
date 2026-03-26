using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới được quản lý ảnh
    public class ProductImagesController : ControllerBase
    {
        private readonly IProductImageService _imageService;

        public ProductImagesController(IProductImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")] // Bắt buộc để Swagger hiện nút chọn file
        public async Task<IActionResult> UploadImages([FromForm] MultipleImageUploadDto dto)
        {
            try
            {
                if (dto.Files == null || !dto.Files.Any())
                    return BadRequest(new { success = false, message = "Vui lòng chọn ít nhất 1 file ảnh." });

                var result = await _imageService.UploadImagesAsync(dto);
                return Ok(new { success = true, message = $"Đã upload thành công {result.Count} ảnh", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var result = await _imageService.DeleteImageAsync(id);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy ảnh" });

            return Ok(new { success = true, message = "Đã xóa ảnh" });
        }
    }
}