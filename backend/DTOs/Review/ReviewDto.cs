using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ReviewCreateDto
    {
        [Required] public int ProductId { get; set; }
        
        [Range(1, 5, ErrorMessage = "Điểm đánh giá phải từ 1 đến 5 sao")]
        public int Rating { get; set; }
        
        [Required(ErrorMessage = "Vui lòng nhập nội dung đánh giá")]
        public string Comment { get; set; } = string.Empty;
    }
}