using System.Globalization;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICouponService _couponService;

        public OrderService(ApplicationDbContext context, ICouponService couponService)
        {
            _context = context;
            _couponService = couponService;
        }

        public async Task<Order> PlaceOrderAsync(int userId, CheckoutDto dto)
        {
            var cartItems = await _context.CartItems
                .Include(c => c.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                throw new Exception("Gio hang dang trong.");
            }

            var order = new Order
            {
                OrderCode = GenerateOrderCode(),
                UserId = userId,
                ReceiverName = dto.ReceiverName,
                ReceiverPhone = dto.ReceiverPhone,
                ShippingAddress = dto.ShippingAddress,
                Note = dto.Note,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = 0,
                OrderStatus = 0,
                DiscountAmount = 0
            };

            decimal subTotal = 0;

            foreach (var item in cartItems)
            {
                var variant = item.ProductVariant;
                if (variant == null || variant.Product == null) continue;

                if (variant.StockQuantity < item.Quantity)
                {
                    throw new Exception($"San pham {variant.Product.Name} (Size {variant.Size}) khong du so luong.");
                }

                variant.StockQuantity -= item.Quantity;

                var lineTotal = variant.Price * item.Quantity;
                subTotal += lineTotal;

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

            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var coupon = await _couponService.ValidateCouponAsync(dto.CouponCode.Trim(), subTotal);
                if (coupon != null)
                {
                    order.DiscountAmount = CalculateDiscount(coupon, subTotal);
                    coupon.UsedCount += 1;
                }
            }

            order.TotalAmount = subTotal - order.DiscountAmount;

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();
            return order;
        }

        private static string GenerateOrderCode()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff", CultureInfo.InvariantCulture);
            var suffix = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
            return $"ORD-{timestamp}-{suffix}";
        }

        private static decimal CalculateDiscount(Coupon coupon, decimal subTotal)
        {
            decimal discount = coupon.DiscountType == 0
                ? subTotal * coupon.DiscountValue / 100m
                : coupon.DiscountValue;

            if (coupon.DiscountType == 0 && coupon.MaxDiscountValue > 0)
            {
                discount = Math.Min(discount, coupon.MaxDiscountValue);
            }

            return Math.Min(discount, subTotal);
        }
    }
}
