namespace backend.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        
        public int OrderId { get; set; }
        public virtual Order? Order { get; set; }

        public int ProductVariantId { get; set; }

        // SNAPSHOT DỮ LIỆU: Lưu cứng thông tin tại thời điểm mua
        public string ProductName { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; } // UnitPrice * Quantity
    }
}