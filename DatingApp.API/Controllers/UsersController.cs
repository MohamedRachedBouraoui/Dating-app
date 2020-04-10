using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [ServiceFilter(typeof(LogUserActivity))]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;

        public UsersController(IDatingRepository datingRepository,
        IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            var currentUserId = GetCurrentUserId();
            userParams.UserId = currentUserId;

            var currentUserFromRepo = await datingRepository.GetUser(currentUserId);

            if (string.IsNullOrWhiteSpace(userParams.Gender)) //filter with gender
            {
                userParams.Gender = currentUserFromRepo.Gender.ToLower() == "male" ? "female" : "male";
            }
            var users = await datingRepository.GetUSers(userParams);
            var usersToReturn = mapper.Map<IEnumerable<UserForDetailsDto>>(users);

            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages); //extension

            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await datingRepository.GetUser(id);
            var userToReturn = mapper.Map<UserForDetailsDto>(user);
            return Ok(userToReturn);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto user)
        {
            if (id != GetCurrentUserId())
            {
                return Unauthorized();
            }

            var userFromRepo = await datingRepository.GetUser(id);

            mapper.Map(user, userFromRepo);
            if (await datingRepository.SaveAll())
            {
                return NoContent();
            }

            throw new Exception($"Updating user '{id}' failed on Save !");
        }




        [HttpPost("{id}/like/{likeeId}")]
        public async Task<IActionResult> AddLike(int id, int likeeId)
        {
            if (CheckIfUserIsLogged(id) == false)
            {
                return Unauthorized();
            }


            var like = await datingRepository.GetLike(id, likeeId);
            if (like != null)
            {
                return BadRequest("You already like this user");
            }

            if (await datingRepository.GetUser(likeeId) == null)
            {
                return NotFound();
            }

            like = new Like
            {
                LikerId = id,
                LikeeId = likeeId
            };

            datingRepository.Add<Like>(like);


            if (await datingRepository.SaveAll())
            {
                return Ok();
            }
            return BadRequest("Failed to like user !");
        }
        private bool CheckIfUserIsLogged(int id)
        {
            return id == GetCurrentUserId();
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        }

    }
}