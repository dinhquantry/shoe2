namespace backend.Models
{
    public class Coupon : SoftDeletableEntity
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty; // VD: TET2025, FREESHIP
        public int DiscountType { get; set; } // 0: Phần trăm (%), 1: Trừ tiền mặt (VNĐ)
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; } // Giá trị đơn hàng tối thiểu để được áp dụng
        public decimal MaxDiscountValue { get; set; } // Số tiền giảm tối đa (nếu dùng loại giảm %)
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int UsageLimit { get; set; } // Tổng số lần mã này được phép nhập
        public int UsedCount { get; set; } = 0; // Số lần khách hàng đã sử dụng thực tế

        public override void SoftDelete(DateTime? deletedAt = null)
        {
            base.SoftDelete(deletedAt);
            IsActive = false;
        }
    }
}
