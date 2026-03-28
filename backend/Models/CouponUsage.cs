namespace backend.Models
{
    public class CouponUsage
    {
        public int Id { get; set; }

        public int CouponId { get; set; }
        public Coupon? Coupon { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        public DateTime UsedAt { get; set; } = DateTime.UtcNow;
    }
}
