using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // 1. DTO hứng dữ liệu từ Client gửi lên
    public class AddToCartDto
    {
        [Required]
        public int ProductVariantId { get; set; }
        
        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
        public int Quantity { get; set; }
    }

    // 2. DTO trả về cho Frontend hiển thị Giỏ hàng
    public class CartViewDto
    {
        public decimal TotalPrice { get; set; } // Tổng tiền của tất cả các món
        public List<CartItemViewDto> Items { get; set; } = new List<CartItemViewDto>();
    }

    // 3. DTO chi tiết từng dòng trong Giỏ hàng
    public class CartItemViewDto
    {
        public int CartItemId { get; set; } // Id của dòng trong bảng CART_ITEMS
        public int ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty; // Lấy ảnh chính
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal SubTotal { get; set; } // Bằng UnitPrice * Quantity
    }
}