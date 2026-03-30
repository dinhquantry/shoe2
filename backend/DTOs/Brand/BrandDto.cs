using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class BrandCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class BrandUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}