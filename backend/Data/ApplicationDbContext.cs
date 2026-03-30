using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponUsage> CouponUsages { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.Children)
                    .HasForeignKey(d => d.ParentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.Property(e => e.BasePrice).HasColumnType("decimal(18,2)");
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SKU).IsUnique();
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.HasOne(pv => pv.Product)
                    .WithMany(p => p.Variants)
                    .HasForeignKey(pv => pv.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.HasOne(pi => pi.Product)
                    .WithMany(p => p.Images)
                    .HasForeignKey(pi => pi.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.HasOne(ci => ci.User)
                    .WithMany()
                    .HasForeignKey(ci => ci.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.ProductVariant)
                    .WithMany()
                    .HasForeignKey(ci => ci.ProductVariantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderCode)
                .IsUnique();

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAddress>(entity =>
            {
                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.HasOne(ua => ua.User)
                    .WithMany()
                    .HasForeignKey(ua => ua.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasIndex(c => c.Code).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<CouponUsage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.CouponId, e.UserId }).IsUnique();
                entity.HasQueryFilter(e => !e.Coupon!.IsDeleted);

                entity.HasOne(e => e.Coupon)
                    .WithMany()
                    .HasForeignKey(e => e.CouponId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasQueryFilter(r => !r.Product!.IsDeleted);
                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Product)
                    .WithMany()
                    .HasForeignKey(r => r.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(r => new { r.UserId, r.ProductId })
                    .IsUnique();
            });
        }
    }
}
