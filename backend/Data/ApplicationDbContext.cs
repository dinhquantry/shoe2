using Microsoft.EntityFrameworkCore;
using backend.Models;

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
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Đảm bảo Email là duy nhất trong hệ thống
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
            });
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasOne(d => d.Parent)
                      .WithMany(p => p.Children)
                      .HasForeignKey(d => d.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            // 2. Ràng buộc Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.Property(e => e.BasePrice).HasColumnType("decimal(18,2)");
            });

            // 3. Ràng buộc ProductVariant và quan hệ 1-N với Product
            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.SKU).IsUnique();
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.HasOne(pv => pv.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(pv => pv.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(pi => pi.ProductVariant)
                      .WithMany(pv => pv.Images)
                      .HasForeignKey(pi => pi.ProductVariantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            // Cấu hình bảng CartItem
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany() // User không cần List<CartItem> cũng được cho nhẹ
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ProductVariant)
                .WithMany()
                .HasForeignKey(ci => ci.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình Order
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderCode)
                .IsUnique();

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 1. CẤU HÌNH BẢNG USER_ADDRESSES (Sổ địa chỉ)
            // ==========================================
            modelBuilder.Entity<UserAddress>()
                .HasOne(ua => ua.User)
                .WithMany()
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ==========================================
            // 2. CẤU HÌNH BẢNG COUPONS (Mã giảm giá)
            // ==========================================
            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // ==========================================
            // 3. CẤU HÌNH BẢNG REVIEWS (Đánh giá)
            // ==========================================
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany()
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade); // Xóa đôi giày -> Xóa sạch bình luận của đôi giày đó


            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.ProductId })
                .IsUnique();
        }
    }
}