using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;

        public UsersController(IUserManagementService userManagementService)
        {
            _userManagementService = userManagementService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? search = null)
        {
            var users = await _userManagementService.GetUsersAsync(search);
            return Ok(new { success = true, data = users });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userManagementService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "Khong tim thay nguoi dung" });
            }

            return Ok(new { success = true, data = user });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserAdminUpdateDto dto)
        {
            try
            {
                var updated = await _userManagementService.UpdateUserAsync(id, dto);
                if (!updated)
                {
                    return NotFound(new { success = false, message = "Khong tim thay nguoi dung" });
                }

                return Ok(new { success = true, message = "Cap nhat nguoi dung thanh cong" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
