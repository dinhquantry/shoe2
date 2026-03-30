using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly ApplicationDbContext _context;

        public ProductVariantService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductVariant?> AddVariantAsync(VariantAddDto dto)
        {
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists)
            {
                throw new Exception("Khong tim thay san pham goc.");
            }

            var skuExists = await _context.ProductVariants
                .IgnoreQueryFilters()
                .AnyAsync(v => v.SKU == dto.SKU);
            if (skuExists)
            {
                throw new Exception("Ma SKU nay da ton tai trong he thong.");
            }

            var variant = new ProductVariant
            {
                ProductId = dto.ProductId,
                SKU = dto.SKU,
                Size = dto.Size,
                Color = dto.Color,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                IsActive = true
            };

            _context.ProductVariants.Add(variant);
            await _context.SaveChangesAsync();
            return variant;
        }

        public async Task<bool> UpdateVariantAsync(int id, VariantUpdateDto dto)
        {
            var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == id);
            if (variant == null) return false;

            var skuExists = await _context.ProductVariants
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id != id && v.SKU == dto.SKU);
            if (skuExists)
            {
                throw new Exception("Ma SKU nay da ton tai trong he thong.");
            }

            variant.SKU = dto.SKU;
            variant.Size = dto.Size;
            variant.Color = dto.Color;
            variant.Price = dto.Price;
            variant.StockQuantity = dto.StockQuantity;
            variant.IsActive = dto.IsActive;

            _context.ProductVariants.Update(variant);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteVariantAsync(int id)
        {
            var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == id);
            if (variant == null) return false;

            var deletedAt = DateTime.UtcNow;
            variant.SoftDelete(deletedAt);

            var relatedCartItems = await _context.CartItems
                .Where(item => item.ProductVariantId == id)
                .ToListAsync();

            foreach (var cartItem in relatedCartItems)
            {
                cartItem.SoftDelete(deletedAt);
            }

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
