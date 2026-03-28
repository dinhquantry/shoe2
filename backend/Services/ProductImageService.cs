using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProductImageService : IProductImageService
    {
        private const int MaxImagesPerProduct = 4;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        public ProductImageService(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private static ProductImageDto MapToDto(ProductImage image) => new()
        {
            Id = image.Id,
            ImageUrl = image.ImageUrl,
            IsMain = image.IsMain
        };

        public async Task<List<ProductImageDto>> GetImagesByProductIdAsync(int productId)
        {
            return await _context.ProductImages
                .AsNoTracking()
                .Where(i => i.ProductId == productId)
                .OrderByDescending(i => i.IsMain)
                .ThenBy(i => i.SortOrder)
                .ThenBy(i => i.Id)
                .Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    IsMain = i.IsMain
                })
                .ToListAsync();
        }

        public async Task<List<ProductImageDto>> UploadImagesAsync(MultipleImageUploadDto dto)
        {
            if (dto.Files == null || !dto.Files.Any())
            {
                throw new Exception("Khong co file anh nao duoc gui len.");
            }

            var productExists = await _context.Products.FindAsync(dto.ProductId);
            if (productExists == null)
            {
                throw new Exception("Khong tim thay san pham.");
            }

            var existingImages = await _context.ProductImages
                .Where(i => i.ProductId == dto.ProductId)
                .OrderByDescending(i => i.IsMain)
                .ThenBy(i => i.SortOrder)
                .ThenBy(i => i.Id)
                .ToListAsync();

            var validFiles = dto.Files.Where(file => file.Length > 0).ToList();
            if (!validFiles.Any())
            {
                throw new Exception("Tat ca file anh deu rong.");
            }

            if (existingImages.Count + validFiles.Count > MaxImagesPerProduct)
            {
                throw new Exception($"Moi san pham chi duoc toi da {MaxImagesPerProduct} anh.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var uploadsFolder = Path.Combine(
                _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                "uploads",
                "products");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var nextSortOrder = existingImages.Any() ? existingImages.Max(i => i.SortOrder) + 1 : 0;
            var hasMainImage = existingImages.Any(i => i.IsMain);
            var uploadedImages = new List<ProductImage>();

            foreach (var file in validFiles)
            {
                if (file.Length > 5 * 1024 * 1024)
                {
                    throw new Exception($"File {file.FileName} vuot qua 5MB.");
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    throw new Exception($"File {file.FileName} khong dung dinh dang anh.");
                }

                var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                await using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var isMain = !hasMainImage && !uploadedImages.Any();
                uploadedImages.Add(new ProductImage
                {
                    ProductId = dto.ProductId,
                    ImageUrl = $"/uploads/products/{uniqueFileName}",
                    IsMain = isMain,
                    SortOrder = nextSortOrder++
                });
            }

            if (uploadedImages.Any())
            {
                await _context.ProductImages.AddRangeAsync(uploadedImages);
                await _context.SaveChangesAsync();
            }

            return uploadedImages
                .Select(MapToDto)
                .ToList();
        }

        public async Task<bool> SetMainImageAsync(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return false;

            var siblingImages = await _context.ProductImages
                .Where(i => i.ProductId == image.ProductId)
                .ToListAsync();

            foreach (var sibling in siblingImages)
            {
                sibling.IsMain = sibling.Id == imageId;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return false;

            var productId = image.ProductId;
            var wasMain = image.IsMain;

            var filePath = Path.Combine(
                _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                image.ImageUrl.TrimStart('/'));

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();

            if (wasMain)
            {
                var replacement = await _context.ProductImages
                    .Where(i => i.ProductId == productId)
                    .OrderBy(i => i.SortOrder)
                    .ThenBy(i => i.Id)
                    .FirstOrDefaultAsync();

                if (replacement != null)
                {
                    replacement.IsMain = true;
                    await _context.SaveChangesAsync();
                }
            }

            return true;
        }
    }
}
