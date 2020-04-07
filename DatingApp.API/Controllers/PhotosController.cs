using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/users/{userId}/photos")]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;
        private readonly Cloudinary cloudinary;

        public PhotosController(IDatingRepository datingRepository,
                                IMapper mapper,
                                IOptions<CloudinarySettings> cloudinaryConfig)
        {
            this.datingRepository = datingRepository;
            this.mapper = mapper;
            this.cloudinaryConfig = cloudinaryConfig;

            Account account = new Account
            {
                ApiKey = cloudinaryConfig.Value.ApiKey,
                ApiSecret = cloudinaryConfig.Value.ApiSecret,
                Cloud = cloudinaryConfig.Value.CloudName,
            };
            cloudinary = new Cloudinary(account);

        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm]PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var file = photoForCreationDto.File;
            var photoUploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(400).Height(400)
                        .Crop("fill").Gravity("face")
                    };
                    photoUploadResult = cloudinary.Upload(uploadParams);
                }
            }
            photoForCreationDto.Url = photoUploadResult.Uri.ToString();
            photoForCreationDto.PublicId = photoUploadResult.PublicId;

            var photoToSave = mapper.Map<Photo>(photoForCreationDto);

            var userFromRepo = await datingRepository.GetUser(userId);

            if (userFromRepo.Photos.Any(u => u.IsMain) == false)
            {
                photoToSave.IsMain = true;
            }

            userFromRepo.Photos.Add(photoToSave);

            if (await datingRepository.SaveAll())
            {
                var photoToReturn = mapper.Map<PhotoForReturnDto>(photoToSave);
                return CreatedAtRoute("GetPhoto", new { userId = userId, photoId = photoToSave.Id }, photoToReturn);
            }
            return BadRequest("Could not add the photo !");

        }


        [HttpGet("{photoId}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int photoId)
        {

            var phtotoFromRepo = await datingRepository.GetPhoto(photoId);
            var photo = mapper.Map<PhotoForReturnDto>(phtotoFromRepo);

            return Ok(photo);
        }

        [HttpPost("{photoId}/set-main")]
        public async Task<IActionResult> SetMainPhoto(int userId, int photoId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var user = await datingRepository.GetUser(userId);

            if (user.Photos.Any(p => p.Id == photoId) == false)
            {
                return Unauthorized();
            }


            var photoFromRepo = await datingRepository.GetPhoto(photoId);

            if (photoFromRepo.IsMain)
            {
                return BadRequest("This is already the main photo !");
            }
            photoFromRepo.IsMain = true;

            var currentMainPhoto = await datingRepository.GetMainPhotoForUser(userId);

            if (currentMainPhoto != null)
            {
                currentMainPhoto.IsMain = false;
            }

            if (await datingRepository.SaveAll())
            {
                return NoContent();
            }

            return BadRequest("Could not update the main photo !");

        }

        [HttpDelete("{photoId}")]
        public async Task<IActionResult> DeletePhoto(int userId, int photoId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var user = await datingRepository.GetUser(userId);

            if (user.Photos.Any(p => p.Id == photoId) == false)
            {
                return Unauthorized();
            }


            var photoFromRepo = await datingRepository.GetPhoto(photoId);

            if (photoFromRepo.IsMain)
            {
                return BadRequest("You Can't Delete the Main photo !");
            }

            if (string.IsNullOrWhiteSpace(photoFromRepo.PublicId) == false)// added by users
            {
                var deletetionParams = new DeletionParams(photoFromRepo.PublicId);
                var deletionResult = cloudinary.Destroy(deletetionParams);

                if (deletionResult.Result.ToLower() != "ok")
                {
                    return BadRequest("Could not Delete the Photo: " + deletionResult.Error.Message);
                }
            }

            datingRepository.Delete(photoFromRepo);

            if (await datingRepository.SaveAll())
            {
                return Ok();
            }
            return BadRequest("Could not Delete the Photo !");
        }
    }
}