using backend.DTOs;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // 1. THÊM SẢN PHẨM MỚI (Dùng ProductCreateDto)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(ProductCreateDto dto)
        {
            try
            {
                var product = await _productService.CreateProductWithVariantsAsync(dto);
                return Ok(new { success = true, message = "Thêm sản phẩm thành công", data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create product failed");
                return this.InternalServerError("Lỗi khi thêm sản phẩm", "product_create_failed");
            }
        }

        // 2. LẤY DANH SÁCH SẢN PHẨM (Có phân trang, tìm kiếm)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page <= 0 || pageSize <= 0)
                return this.BadRequestError("page và pageSize phải lớn hơn 0", "invalid_paging");

            var result = await _productService.GetProductsAsync(search, categoryId, page, pageSize);
            return Ok(new { success = true, data = result });
        }

        // 3. LẤY CHI TIẾT 1 SẢN PHẨM
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return this.NotFoundError("Không tìm thấy sản phẩm", "product_not_found");

            return Ok(new { success = true, data = product });
        }

        // 4. CẬP NHẬT THÔNG TIN CHUNG CỦA SẢN PHẨM
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProductUpdateDto dto)
        {
            var result = await _productService.UpdateProductAsync(id, dto);
            if (!result) return this.NotFoundError("Không tìm thấy sản phẩm", "product_not_found");

            return Ok(new { success = true, message = "Cập nhật thành công" });
        }

        // 5. XÓA SẢN PHẨM
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result) return this.NotFoundError("Không tìm thấy sản phẩm", "product_not_found");

            return Ok(new { success = true, message = "Đã xóa sản phẩm và các biến thể liên quan" });
        }
    }
}