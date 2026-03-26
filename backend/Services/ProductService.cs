using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context) => _context = context;

        public async Task<Product> CreateProductWithVariantsAsync(ProductCreateDto dto)
        {
            // 1. Khởi tạo đối tượng Product (Cha)
            var product = new Product
            {
                Name = dto.Name,
                Slug = GenerateSlug(dto.Name), // Hàm phụ trợ bên dưới
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                BrandId = dto.BrandId,
                CategoryId = dto.CategoryId,
                IsActive = true,
                IsFeatured = false,

                // 2. Chuyển đổi mảng DTO thành mảng Entity (Con)
                Variants = dto.Variants.Select(v => new ProductVariant
                {
                    SKU = v.SKU,
                    Size = v.Size,
                    Color = v.Color,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    IsActive = true
                }).ToList()
            };

            // 3. Thêm vào Context
            _context.Products.Add(product);

            // 4. Lệnh này là "Phép thuật" của EF Core: 
            // Nó sẽ tự động INSERT Product, lấy ID vừa tạo ra, 
            // gán vào trường ProductId của từng Variant, rồi INSERT các Variant.
            // Tất cả nằm trong 1 Transaction ngầm định!
            await _context.SaveChangesAsync();

            return product;
        }

        // Hàm hỗ trợ tạo Slug chuẩn SEO (VD: "Giày Nike" -> "giay-nike")
        private string GenerateSlug(string phrase)
        {
            string str = phrase.ToLower();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", ""); // Xóa ký tự đặc biệt
            str = Regex.Replace(str, @"\s+", " ").Trim(); // Xóa khoảng trắng thừa
            str = Regex.Replace(str, @"\s", "-"); // Thay khoảng trắng bằng dấu gạch ngang
            return str + "-" + DateTimeOffset.Now.ToUnixTimeMilliseconds(); // Thêm timestamp để đảm bảo Unique
        }

        // 1. LẤY DANH SÁCH (CÓ PHÂN TRANG VÀ LỌC)
        public async Task<object> GetProductsAsync(string? search, int? categoryId, int page = 1, int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;
            var query = _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .AsQueryable();

            // Lọc theo từ khóa tìm kiếm
            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search)));

            // Lọc theo danh mục
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            // Tính toán phân trang
            int totalItems = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            // Lấy dữ liệu của trang hiện tại và map sang DTO
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    BasePrice = p.BasePrice,
                    BrandName = p.Brand != null ? p.Brand.Name : "",
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    Variants = p.Variants.Select(v => new VariantDto
                    {
                        Id = v.Id,
                        SKU = v.SKU,
                        Size = v.Size,
                        Color = v.Color,
                        Price = v.Price,
                        StockQuantity = v.StockQuantity
                    }).ToList()
                }).ToListAsync();

            // Trả về cả dữ liệu và thông tin phân trang
            return new
            {
                Items = products,
                PageInfo = new { CurrentPage = page, PageSize = pageSize, TotalItems = totalItems, TotalPages = totalPages }
            };
        }

        // 2. LẤY CHI TIẾT 1 SẢN PHẨM
        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return null;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                BasePrice = product.BasePrice,
                BrandName = product.Brand?.Name ?? "",
                CategoryName = product.Category?.Name ?? "",
                Variants = product.Variants.Select(v => new VariantDto
                {
                    Id = v.Id,
                    SKU = v.SKU,
                    Size = v.Size,
                    Color = v.Color,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList()
            };
        }

        // 3. CẬP NHẬT THÔNG TIN SẢN PHẨM
        public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.Name = dto.Name;
            // Cập nhật Slug nếu tên thay đổi (tùy logic của em, có thể gọi lại hàm GenerateSlug)
            product.Description = dto.Description;
            product.BasePrice = dto.BasePrice;
            product.BrandId = dto.BrandId;
            product.CategoryId = dto.CategoryId;
            product.IsActive = dto.IsActive;

            _context.Products.Update(product);
            return await _context.SaveChangesAsync() > 0;
        }

        // 4. XÓA SẢN PHẨM (CASCADE DELETE)
        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            // Nhờ cấu hình OnDelete(DeleteBehavior.Cascade) trong DbContext, 
            // khi xóa Product, MySQL sẽ tự động xóa tất cả ProductVariant và ProductImage liên quan.
            _context.Products.Remove(product);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}