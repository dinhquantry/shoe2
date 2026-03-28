using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class MultipleImageUploadDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public List<IFormFile>? Files { get; set; }
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }
}
