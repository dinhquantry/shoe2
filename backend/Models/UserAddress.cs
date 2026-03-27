namespace backend.Models
{
    public class UserAddress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public string ReceiverName { get; set; } = string.Empty;
        public string ReceiverPhone { get; set; } = string.Empty;
        
        // Cấu trúc hành chính 2 cấp (Từ 01/07/2025)
        public string Province { get; set; } = string.Empty; // 1 trong 34 Tỉnh/Thành phố
        public string Ward { get; set; } = string.Empty;     // 1 trong 3.321 Xã/Phường/Đặc khu
        
        public string DetailAddress { get; set; } = string.Empty; // Số nhà, ngõ, tên đường
        
        public bool IsDefault { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}