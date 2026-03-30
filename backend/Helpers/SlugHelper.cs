using System.Text.RegularExpressions;

namespace backend.Helpers
{
    public static class SlugHelper
    {
        public static string Generate(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var normalized = value.ToLowerInvariant();
            normalized = Regex.Replace(normalized, @"[^a-z0-9\s-]", string.Empty);
            normalized = Regex.Replace(normalized, @"\s+", " ").Trim();
            normalized = Regex.Replace(normalized, @"\s", "-");

            return $"{normalized}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        }
    }
}
