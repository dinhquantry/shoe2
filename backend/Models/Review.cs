namespace backend.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public int Rating { get; set; } // Điểm đánh giá (1 đến 5 sao)
        public string Comment { get; set; } = string.Empty;
        
        public bool IsApproved { get; set; } = false; // Admin duyệt mới được hiển thị, chống spam
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}