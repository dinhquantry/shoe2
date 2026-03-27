using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        public CartService(ApplicationDbContext context) => _context = context;

        // 1. LẤY CHI TIẾT GIỎ HÀNG
        public async Task<CartViewDto> GetCartByUserIdAsync(int userId)
        {
            // Lấy tất cả CartItem của UserId này, kèm theo thông tin Giày và Ảnh
            var cartItems = await _context.CartItems
                .Include(i => i.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                .Include(i => i.ProductVariant)
                    .ThenInclude(pv => pv!.Images)
                .Where(i => i.UserId == userId)
                .ToListAsync();

            var cartView = new CartViewDto();

            foreach (var item in cartItems)
            {
                var variant = item.ProductVariant;
                if (variant == null || variant.Product == null) continue;

                // Lấy ảnh đại diện (IsMain = true), nếu không có thì lấy ảnh đầu tiên
                var mainImage = variant.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl 
                                ?? variant.Images.FirstOrDefault()?.ImageUrl ?? "";

                var itemDto = new CartItemViewDto
                {
                    CartItemId = item.Id,
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.Name,
                    Size = variant.Size,
                    Color = variant.Color,
                    ImageUrl = mainImage,
                    UnitPrice = variant.Price,
                    Quantity = item.Quantity,
                    SubTotal = variant.Price * item.Quantity
                };
                
                cartView.Items.Add(itemDto);
                cartView.TotalPrice += itemDto.SubTotal; // Cộng dồn tổng tiền
            }

            return cartView;
        }

        // 2. THÊM VÀO GIỎ HÀNG
        public async Task<bool> AddItemToCartAsync(int userId, AddToCartDto dto)
        {
            var variant = await _context.ProductVariants.FindAsync(dto.ProductVariantId);
            if (variant == null) throw new Exception("Biến thể sản phẩm không tồn tại.");
            if (variant.StockQuantity < dto.Quantity) throw new Exception("Không đủ số lượng trong kho.");

            // Kiểm tra món này đã có trong giỏ của User chưa
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(i => i.UserId == userId && i.ProductVariantId == dto.ProductVariantId);

            if (existingItem != null)
            {
                // Có rồi thì cộng dồn số lượng
                if (existingItem.Quantity + dto.Quantity > variant.StockQuantity)
                    throw new Exception("Vượt quá số lượng tồn kho cho phép.");
                    
                existingItem.Quantity += dto.Quantity;
                _context.CartItems.Update(existingItem);
            }
            else
            {
                // Chưa có thì tạo mới
                var newItem = new CartItem
                {
                    UserId = userId,
                    ProductVariantId = dto.ProductVariantId,
                    Quantity = dto.Quantity
                };
                _context.CartItems.Add(newItem);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        // 3. CẬP NHẬT SỐ LƯỢNG TRỰC TIẾP
        public async Task<bool> UpdateCartItemQuantityAsync(int userId, int cartItemId, int quantity)
        {
            var item = await _context.CartItems
                .Include(i => i.ProductVariant)
                .FirstOrDefaultAsync(i => i.Id == cartItemId && i.UserId == userId);

            if (item == null) return false;
            
            if (quantity <= 0) 
            {
                // Nếu số lượng <= 0 thì xóa luôn khỏi giỏ
                _context.CartItems.Remove(item);
            }
            else
            {
                if (item.ProductVariant != null && item.ProductVariant.StockQuantity < quantity)
                    throw new Exception("Vượt quá số lượng tồn kho.");

                item.Quantity = quantity;
                _context.CartItems.Update(item);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        // 4. XÓA KHỎI GIỎ
        public async Task<bool> RemoveItemFromCartAsync(int userId, int cartItemId)
        {
            var itemToRemove = await _context.CartItems
                .FirstOrDefaultAsync(i => i.Id == cartItemId && i.UserId == userId);

            if (itemToRemove == null) return false;

            _context.CartItems.Remove(itemToRemove);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}