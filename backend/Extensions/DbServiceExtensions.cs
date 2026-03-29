using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
//File này chuyên trách việc cấu hình MySQL
namespace backend.Extensions
{
    public static class DbServiceExtensions
    {
        public static IServiceCollection AddDbLayer(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("DefaultConnection");
            services.AddScoped<IAuthService, AuthService>();
            services.AddDbContext<ApplicationDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
            services.AddScoped<IBrandService, BrandService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductVariantService, ProductVariantService>();
            services.AddScoped<IProductImageService, ProductImageService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IUserAddressService, UserAddressService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<ICouponService, CouponService>();
            services.AddScoped<IUserManagementService, UserManagementService>();

            services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                        {
                            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                                  .AllowAnyHeader()
                                  .AllowAnyMethod();
                        });
                });
            return services;
        }
    }
}
