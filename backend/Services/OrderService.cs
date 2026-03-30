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
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
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

                Coupon? coupon = null;

                if (!string.IsNullOrWhiteSpace(dto.CouponCode))
                {
                    coupon = await _couponService.ValidateCouponAsync(dto.CouponCode.Trim(), subTotal, userId);
                    if (coupon != null)
                    {
                        order.DiscountAmount = CalculateDiscount(coupon, subTotal);
                    }
                }

                order.TotalAmount = subTotal - order.DiscountAmount;

                _context.Orders.Add(order);

                foreach (var cartItem in cartItems)
                {
                    cartItem.SoftDelete();
                }

                await _context.SaveChangesAsync();

                if (coupon != null)
                {
                    var recorded = await _couponService.RecordCouponUsageAsync(coupon.Id, userId, order.Id);
                    if (!recorded)
                    {
                        throw new Exception("Khong tim thay ma giam gia.");
                    }
                }

                await transaction.CommitAsync();
                return order;
            }
            catch (DbUpdateException ex) when (IsDuplicateCouponUsage(ex))
            {
                await transaction.RollbackAsync();
                throw new Exception("Ban da su dung ma giam gia nay truoc do.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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

        private static bool IsDuplicateCouponUsage(DbUpdateException exception)
        {
            var message = exception.InnerException?.Message ?? exception.Message;
            return message.Contains("IX_CouponUsages_CouponId_UserId", StringComparison.OrdinalIgnoreCase);
        }
    }
}
