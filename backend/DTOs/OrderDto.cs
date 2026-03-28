using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CheckoutDto
    {
        [Required]
        public string ReceiverName { get; set; } = string.Empty;

        [Required]
        public string ReceiverPhone { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public string? Note { get; set; }

        public int PaymentMethod { get; set; }

        public string? CouponCode { get; set; }
    }
}
