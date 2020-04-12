using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Threading.Tasks;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : SharedController
    {
        private readonly DataContext dataContext;
        private readonly UserManager<User> userManager;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;
        private readonly Cloudinary cloudinary;

        public AdminController(DataContext dataContext, UserManager<User> userManager,
            IOptions<CloudinarySettings> cloudinaryConfig)
        {
            this.dataContext = dataContext;
            this.userManager = userManager;
            this.cloudinaryConfig = cloudinaryConfig;

            Account account = new Account(
                 cloudinaryConfig.Value.CloudName,
                 cloudinaryConfig.Value.ApiKey,
                 cloudinaryConfig.Value.ApiSecret
                );

            cloudinary = new Cloudinary(account);
        }


        [Authorize(Policy = MyPolicies.REQUIERE_ADMIN_ROLE)]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
        {
            var userList = await dataContext.Users.OrderBy(x => x.UserName)
                .Select(user =>
                new
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Roles = user.UserRoles.Select(r => r.Role.Name)
                }).ToListAsync();


            return Ok(userList);
        }


        [Authorize(Policy = MyPolicies.REQUIERE_ADMIN_ROLE)]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditUserRoles(string userName, RoleEditDto roleEditDto)
        {
            var user = await userManager.FindByNameAsync(userName);

            var existingUserRoles = await userManager.GetRolesAsync(user);
            var resultRemove = await userManager.RemoveFromRolesAsync(user, existingUserRoles);

            if (resultRemove.Succeeded == false)
            {
                return BadRequest($"Error removing {userName}'s old roles");
            }

            var newRoles = roleEditDto.RoleNames ?? new string[] { };

            var resultAddRoles = await userManager.AddToRolesAsync(user, newRoles);
            if (resultAddRoles.Succeeded == false)
            {
                return BadRequest($"Error updating {userName}'s roles");
            }
            return Ok(await userManager.GetRolesAsync(user));
        }


        [Authorize(Policy = MyPolicies.REQUIERE_MODERATE_PHOTO_ROLE)]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
            var photos = await dataContext.Photos
                .Include(u => u.User)
                .IgnoreQueryFilters()
                .Where(p => p.IsApproved == false)
                .Select(ph =>
               new
               {
                   Id = ph.Id,
                   Url = ph.Url,
                   IsApproved = ph.IsApproved,
                   UserName = ph.User.UserName

               }).ToListAsync();

            return Ok(photos);
        }

        [Authorize(Policy = MyPolicies.REQUIERE_MODERATE_PHOTO_ROLE)]
        [HttpPost("approvePhoto/{photoId}")]
        public async Task<IActionResult> ApprovePhoto(int photoId)
        {
            var photo= await dataContext.Photos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id==photoId);

            photo.IsApproved = true;

            await dataContext.SaveChangesAsync();

            return Ok();
        }

        [Authorize(Policy = MyPolicies.REQUIERE_MODERATE_PHOTO_ROLE)]
        [HttpPost("rejectPhoto/{photoId}")]
        public async Task<IActionResult> RejectPhoto(int photoId)
        {
            var photo = await dataContext.Photos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == photoId);

            if (photo.IsMain)
            {
                return BadRequest("You cannot reject the main photo");
            }

            if (string.IsNullOrWhiteSpace(photo.PublicId) == false)
            {
                var deleteParams = new DeletionParams(photo.PublicId);
                var deletionResult = await cloudinary.DestroyAsync(deleteParams);
            }

            dataContext.Photos.Remove(photo);

            await dataContext.SaveChangesAsync();

            return Ok();
        }
    }
}
