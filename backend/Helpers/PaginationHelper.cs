namespace backend.Helpers
{
    public sealed record PaginationMetadata(
        int CurrentPage,
        int PageSize,
        int TotalItems,
        int TotalPages);

    public static class PaginationHelper
    {
        public static PaginationMetadata Create(int currentPage, int pageSize, int totalItems)
        {
            var safePage = currentPage < 1 ? 1 : currentPage;
            var safePageSize = pageSize < 1 ? 10 : pageSize;
            var totalPages = (int)Math.Ceiling(totalItems / (double)safePageSize);

            return new PaginationMetadata(
                safePage,
                safePageSize,
                totalItems,
                totalPages);
        }
    }
}
