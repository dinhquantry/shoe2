namespace backend.Models
{
    public class ProductImage
    {
        public int Id { get; set; } 
        public string ImageUrl { get; set; } = string.Empty; // Đường dẫn ảnh 

        // Khóa ngoại trỏ về Biến thể màu sắc nào 
        public int ProductVariantId { get; set; }
        public virtual ProductVariant? ProductVariant { get; set; }

        public bool IsMain { get; set; } = false; 
        public int SortOrder { get; set; } = 0; 
    }
}