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
            // Kiểm tra xem Product có tồn tại không
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists) throw new Exception("Không tìm thấy sản phẩm gốc.");

            // Kiểm tra trùng mã SKU
            var skuExists = await _context.ProductVariants.AnyAsync(v => v.SKU == dto.SKU);
            if (skuExists) throw new Exception("Mã SKU này đã tồn tại trong hệ thống.");

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

            // Chỉ cho phép cập nhật Giá, Tồn kho và Trạng thái
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

            // Xóa biến thể. (Lưu ý: Nếu có hóa đơn đã mua biến thể này, 
            // có thể sẽ bị lỗi constraint. Tốt nhất là dùng IsActive = false)
            _context.ProductVariants.Remove(variant);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}