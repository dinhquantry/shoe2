using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // DTO nhận dữ liệu từ màn hình Thanh toán (Checkout)
    public class CheckoutDto
    {
        [Required] public string ReceiverName { get; set; } = string.Empty;
        [Required] public string ReceiverPhone { get; set; } = string.Empty;
        [Required] public string ShippingAddress { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int PaymentMethod { get; set; } // 0 = COD, 1 = Online
        // Tạm thời chưa xử lý Coupon code ở đây, em có thể nâng cấp sau
    }
}