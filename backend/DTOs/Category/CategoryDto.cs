using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CategoryCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? ParentId { get; set; }
    }

    public class CategoryUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? ParentId { get; set; }
    }

    public class CategoryTreeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<CategoryTreeDto> Children { get; set; } = new();
    }
}