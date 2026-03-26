namespace backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; } // Giá gốc để hiển thị chung 
        
        public bool IsFeatured { get; set; } = false; // Sản phẩm nổi bật
        public bool IsActive { get; set; } = true;

        public int BrandId { get; set; }
        public virtual Brand? Brand { get; set; }

        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }

        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}