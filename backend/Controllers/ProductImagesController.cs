using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ProductImagesController : ControllerBase
    {
        private readonly IProductImageService _imageService;

        public ProductImagesController(IProductImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProductId(int productId)
        {
            try
            {
                var images = await _imageService.GetImagesByProductIdAsync(productId);
                return Ok(new
                {
                    success = true,
                    data = images
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages([FromForm] MultipleImageUploadDto dto)
        {
            try
            {
                if (dto.Files == null || !dto.Files.Any())
                {
                    return BadRequest(new { success = false, message = "Vui long chon it nhat 1 file anh." });
                }

                var result = await _imageService.UploadImagesAsync(dto);
                return Ok(new
                {
                    success = true,
                    message = $"Da upload thanh cong {result.Count} anh.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id:int}/set-main")]
        public async Task<IActionResult> SetMainImage(int id)
        {
            var result = await _imageService.SetMainImageAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Khong tim thay anh." });
            }

            return Ok(new { success = true, message = "Da dat anh chinh." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var result = await _imageService.DeleteImageAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Khong tim thay anh." });
            }

            return Ok(new { success = true, message = "Da xoa anh." });
        }
    }
}
