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

            var skuExists = await _context.ProductVariants.AnyAsync(v => v.SKU == dto.SKU);
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
            var variant = await _context.ProductVariants.FindAsync(id);
            if (variant == null) return false;

            var skuExists = await _context.ProductVariants
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
            var variant = await _context.ProductVariants.FindAsync(id);
            if (variant == null) return false;

            _context.ProductVariants.Remove(variant);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
