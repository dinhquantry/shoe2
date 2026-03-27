using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        public OrderService(ApplicationDbContext context) => _context = context;

        public async Task<Order> PlaceOrderAsync(int userId, CheckoutDto dto)
        {
            // 1. Lấy toàn bộ Giỏ hàng của User
            var cartItems = await _context.CartItems
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any()) throw new Exception("Giỏ hàng đang trống.");

            // 2. Khởi tạo Đơn hàng mới
            var order = new Order
            {
                OrderCode = "ORD-" + DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), // Tạo mã đơn duy nhất
                UserId = userId,
                ReceiverName = dto.ReceiverName,
                ReceiverPhone = dto.ReceiverPhone,
                ShippingAddress = dto.ShippingAddress,
                Note = dto.Note,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = 0, // Mặc định chưa thanh toán
                OrderStatus = 0,   // Mặc định chờ duyệt
                DiscountAmount = 0 // Tạm thời chưa làm Coupon
            };

            decimal subTotal = 0;

            // 3. Xử lý từng món trong giỏ
            foreach (var item in cartItems)
            {
                var variant = item.ProductVariant;
                if (variant == null || variant.Product == null) continue;

                // Kiểm tra lại tồn kho lần cuối trước khi chốt đơn
                if (variant.StockQuantity < item.Quantity)
                    throw new Exception($"Sản phẩm {variant.Product.Name} (Size {variant.Size}) không đủ số lượng.");

                // Trừ tồn kho thực tế
                variant.StockQuantity -= item.Quantity;

                var lineTotal = variant.Price * item.Quantity;
                subTotal += lineTotal;

                // Chụp nhanh (Snapshot) thông tin sản phẩm
                order.OrderItems.Add(new OrderItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.Name,
                    Size = variant.Size,
                    Color = variant.Color,
                    UnitPrice = variant.Price,
                    Quantity = item.Quantity,
                    LineTotal = lineTotal
                });
            }

            order.SubTotal = subTotal;
            order.TotalAmount = subTotal - order.DiscountAmount;

            // 4. Lưu đơn hàng vào DB
            _context.Orders.Add(order);

            // 5. Xóa giỏ hàng (vì đã mua xong)
            _context.CartItems.RemoveRange(cartItems);

            // Lưu toàn bộ (Tạo Đơn, Trừ Kho, Xóa Giỏ) trong 1 Transaction ngầm định!
            await _context.SaveChangesAsync();

            return order;
        }
    }
}