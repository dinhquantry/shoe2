namespace backend.Models
{
    public class Category : SoftDeletableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? ParentId { get; set; }
        public virtual Category? Parent { get; set; }
        public virtual ICollection<Category> Children { get; set; } = new List<Category>();

        public override void SoftDelete(DateTime? deletedAt = null)
        {
            base.SoftDelete(deletedAt);
            IsActive = false;
        }
    }
}
