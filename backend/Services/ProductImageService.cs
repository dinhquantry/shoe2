using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public class ProductImageService : IProductImageService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env; // Dùng để lấy đường dẫn thư mục gốc của Server

        public ProductImageService(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

       public async Task<List<ProductImage>> UploadImagesAsync(MultipleImageUploadDto dto)
{
    var variantExists = await _context.ProductVariants.FindAsync(dto.ProductVariantId);
    if (variantExists == null) throw new Exception("Không tìm thấy biến thể sản phẩm.");

    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "products");
    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

    var uploadedImages = new List<ProductImage>();

    // VÒNG LẶP XỬ LÝ TỪNG FILE
    foreach (var file in dto.Files!)
    {
        if (file.Length == 0) continue; // Bỏ qua file rỗng
        if (file.Length > 5 * 1024 * 1024) throw new Exception($"File {file.FileName} vượt quá 5MB.");

        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
            throw new Exception($"File {file.FileName} không đúng định dạng ảnh.");

        string uniqueFileName = Guid.NewGuid().ToString() + extension;
        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Tạo Entity ảnh
        uploadedImages.Add(new ProductImage
        {
            ProductVariantId = dto.ProductVariantId,
            ImageUrl = $"/uploads/products/{uniqueFileName}",
            // Mặc định ảnh đầu tiên trong list tải lên sẽ là ảnh chính (nếu chưa có ảnh nào)
            IsMain = dto.Files.IndexOf(file) == 0, 
            SortOrder = 0
        });
    }

    // LƯU TOÀN BỘ VÀO DATABASE TRONG 1 LẦN GỌI
    if (uploadedImages.Any())
    {
        await _context.ProductImages.AddRangeAsync(uploadedImages);
        await _context.SaveChangesAsync();
    }

    return uploadedImages;
}

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return false;

            // 1. Xóa file vật lý trên ổ cứng
            string filePath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), image.ImageUrl.TrimStart('/'));
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // 2. Xóa data trong DB
            _context.ProductImages.Remove(image);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}