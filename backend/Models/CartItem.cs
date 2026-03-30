namespace backend.Models
{
    public class CartItem : SoftDeletableEntity
    {
        public int Id { get; set; }

        // Khóa ngoại trỏ thẳng về User
        public int UserId { get; set; }
        public virtual User? User { get; set; }
        // Khóa ngoại trỏ về Biến thể sản phẩm (Size/Màu)
        public int ProductVariantId { get; set; }
        public virtual ProductVariant? ProductVariant { get; set; }
        public int Quantity { get; set; }
    }
}
