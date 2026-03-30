using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    internal static class SoftDeleteCascadeHelper
    {
        public static async Task SoftDeleteProductGraphAsync(
            ApplicationDbContext context,
            IQueryable<Product> productsQuery,
            DateTime? deletedAt = null)
        {
            var effectiveDeletedAt = deletedAt ?? DateTime.UtcNow;
            var products = await productsQuery
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .ToListAsync();

            if (products.Count == 0)
            {
                return;
            }

            var variantIds = new List<int>();

            foreach (var product in products)
            {
                product.SoftDelete(effectiveDeletedAt);

                foreach (var variant in product.Variants)
                {
                    variant.SoftDelete(effectiveDeletedAt);
                    variantIds.Add(variant.Id);
                }

                foreach (var image in product.Images)
                {
                    image.SoftDelete(effectiveDeletedAt);
                }
            }

            if (variantIds.Count == 0)
            {
                return;
            }

            var cartItems = await context.CartItems
                .Where(item => variantIds.Contains(item.ProductVariantId))
                .ToListAsync();

            foreach (var cartItem in cartItems)
            {
                cartItem.SoftDelete(effectiveDeletedAt);
            }
        }
    }
}
