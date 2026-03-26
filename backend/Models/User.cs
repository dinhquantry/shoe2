using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; } // Khóa chính tự tăng [cite: 2]

        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty; 

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty; 

        [Required, MaxLength(20)]
        public string Phone { get; set; } = string.Empty; 

        [Required]
        public string PasswordHash { get; set; } = string.Empty; // Lưu mật khẩu đã mã hóa 

        public int Role { get; set; } = 0; // 0 = Khách hàng, 1 = Admin [cite: 5]
        public int Status { get; set; } = 1; // 1 = Đang hoạt động [cite: 6]
        
        public string? AvatarUrl { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; } 
    }
}