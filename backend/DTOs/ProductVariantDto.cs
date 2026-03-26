using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Dùng khi muốn thêm 1 size/màu mới cho sản phẩm đã có
    public class VariantAddDto
    {
        [Required]
        public int ProductId { get; set; } 

        [Required]
        public string SKU { get; set; } = string.Empty;

        [Required]
        public string Size { get; set; } = string.Empty;

        [Required]
        public string Color { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
    }

    // Dùng khi nhân viên kho muốn cập nhật giá hoặc số lượng
    public class VariantUpdateDto
    {
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
    }
    public class VariantCreateDto
    {
        [Required]
        public string SKU { get; set; } = string.Empty;
        [Required]
        public string Size { get; set; } = string.Empty;
        [Required]
        public string Color { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
    }
    
}