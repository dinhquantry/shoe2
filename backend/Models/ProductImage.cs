namespace backend.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        public bool IsMain { get; set; } = false;
        public int SortOrder { get; set; } = 0;
    }
}
