using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int BrandId { get; set; }
        public int CategoryId { get; set; }

        // Danh sách các biến thể gửi kèm
        [Required]
        public List<VariantCreateDto> Variants { get; set; } = new List<VariantCreateDto>();
    }
    // DTO dùng để trả về dữ liệu cho Frontend hiển thị
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string BrandName { get; set; } = string.Empty; 
        public string CategoryName { get; set; } = string.Empty;
        
        // Trả về danh sách biến thể
        public List<VariantDto> Variants { get; set; } = new List<VariantDto>();
    }

    public class VariantDto
    {
        public int Id { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
    }

    // DTO dùng để Cập nhật thông tin cơ bản của Sản phẩm
    public class ProductUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int BrandId { get; set; }
        public int CategoryId { get; set; }
        public bool IsActive { get; set; }
    }
   
}