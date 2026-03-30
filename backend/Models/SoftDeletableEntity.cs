namespace backend.Models
{
    public abstract class SoftDeletableEntity
    {
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        public virtual void SoftDelete(DateTime? deletedAt = null)
        {
            if (IsDeleted)
            {
                return;
            }

            IsDeleted = true;
            DeletedAt = deletedAt ?? DateTime.UtcNow;
        }
    }
}
