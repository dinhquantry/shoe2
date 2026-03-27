namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty; // VD: ORD-12345
        
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? Note { get; set; }

        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; } // Khấu trừ từ Coupon (nếu có)
        public decimal TotalAmount { get; set; } // Bằng SubTotal - DiscountAmount

        public int PaymentMethod { get; set; } // 0 = COD, 1 = Online
        public int PaymentStatus { get; set; } // 0 = Chưa thanh toán, 1 = Đã thanh toán
        public int OrderStatus { get; set; } // 0 = Chờ duyệt, 1 = Đã chốt, 2 = Đang giao, 3 = Hoàn thành, 4 = Đã hủy

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}