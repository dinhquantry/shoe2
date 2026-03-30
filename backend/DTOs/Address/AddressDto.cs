using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AddressCreateUpdateDto
    {
        [Required] public string ReceiverName { get; set; } = string.Empty;
        [Required] public string ReceiverPhone { get; set; } = string.Empty;
        [Required] public string Province { get; set; } = string.Empty;
        [Required] public string Ward { get; set; } = string.Empty;
        [Required] public string DetailAddress { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}