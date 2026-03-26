namespace backend.Models
{
    public class ProductVariant
    {
        public int Id { get; set; } // Khóa chính của biến thể 
        
        // Khóa ngoại trỏ về sản phẩm gốc [cite: 25]
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        // Chi tiết biến thể
        public string SKU { get; set; } = string.Empty; // Mã vạch/Mã lưu kho duy nhất 
        public string Size { get; set; } = string.Empty; 
        public string Color { get; set; } = string.Empty; 
        
        public decimal Price { get; set; } // Giá bán chính thức của biến thể này 
        public int StockQuantity { get; set; } // Số lượng tồn kho thực tế 
        public bool IsActive { get; set; } = true; 

        // 1 Biến thể có nhiều hình ảnh
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}