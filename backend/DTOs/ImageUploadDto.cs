using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class MultipleImageUploadDto
    {
        [Required]
        public int ProductVariantId { get; set; }

        [Required]
        public List<IFormFile>? Files { get; set; } // Đổi thành List để nhận nhiều file

        // Bỏ IsMain đi vì khi up nhiều ảnh, ta thường mặc định ảnh đầu tiên là ảnh chính, 
        // hoặc admin sẽ vào set lại sau.
    }
}