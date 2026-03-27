using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CouponCreateUpdateDto
    {
        [Required] public string Code { get; set; } = string.Empty;
        public int DiscountType { get; set; } 
        public decimal DiscountValue { get; set; } 
        public decimal MinOrderValue { get; set; } 
        public decimal MaxDiscountValue { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
    }
}