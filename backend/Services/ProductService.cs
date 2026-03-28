using System.Text.RegularExpressions;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context) => _context = context;

        // ✅ Đã sửa: Trả về ProductDto thay vì Product
        public async Task<ProductDto> CreateProductWithVariantsAsync(ProductCreateDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Slug = GenerateSlug(dto.Name),
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                BrandId = dto.BrandId,
                CategoryId = dto.CategoryId,
                IsActive = true,
                IsFeatured = false,
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

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // ✅ Lấy thêm thông tin Brand và Category để map DTO cho đầy đủ
            await _context.Entry(product).Reference(p => p.Brand).LoadAsync();
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            // ✅ Trả về DTO an toàn, KHÔNG BAO GIỜ bị lỗi vòng lặp JSON nữa
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Slug = product.Slug,
                Description = product.Description,
                BasePrice = product.BasePrice,
                BrandId = product.BrandId,
                BrandName = product.Brand?.Name ?? string.Empty,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                IsActive = product.IsActive,
                Variants = product.Variants.Select(v => new VariantDto
                {
                    Id = v.Id,
                    SKU = v.SKU,
                    Size = v.Size,
                    Color = v.Color,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                }).ToList()
            };
        }

        private string GenerateSlug(string phrase)
        {
            var str = phrase.ToLowerInvariant();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = Regex.Replace(str, @"\s", "-");
            return $"{str}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        }

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

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Name.Contains(search) ||
                                         (p.Description != null && p.Description.Contains(search)));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Description = p.Description,
                    BasePrice = p.BasePrice,
                    BrandId = p.BrandId,
                    BrandName = p.Brand != null ? p.Brand.Name : string.Empty,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    IsActive = p.IsActive,
                    Variants = p.Variants.Select(v => new VariantDto
                    {
                        Id = v.Id,
                        SKU = v.SKU,
                        Size = v.Size,
                        Color = v.Color,
                        Price = v.Price,
                        StockQuantity = v.StockQuantity,
                        IsActive = v.IsActive
                    }).ToList()
                })
                .ToListAsync();

            return new
            {
                Items = products,
                PageInfo = new
                {
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalItems = totalItems,
                    TotalPages = totalPages
                }
            };
        }

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
                Description = product.Description,
                BasePrice = product.BasePrice,
                BrandId = product.BrandId,
                BrandName = product.Brand?.Name ?? string.Empty,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                IsActive = product.IsActive,
                Variants = product.Variants.Select(v => new VariantDto
                {
                    Id = v.Id,
                    SKU = v.SKU,
                    Size = v.Size,
                    Color = v.Color,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                }).ToList()
            };
        }

        public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.BasePrice = dto.BasePrice;
            product.BrandId = dto.BrandId;
            product.CategoryId = dto.CategoryId;
            product.IsActive = dto.IsActive;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            _context.Products.Remove(product);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
