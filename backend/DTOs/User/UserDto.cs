using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UserAdminDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int Role { get; set; }
        public int Status { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class UserAdminUpdateDto
    {
        [Range(0, 1)]
        public int Status { get; set; }
    }
}
