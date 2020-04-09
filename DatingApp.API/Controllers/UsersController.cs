using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
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
        public async Task<IActionResult> GetUsers()
        {
            var users = await datingRepository.GetUSers();
            var usersToReturn = mapper.Map<IEnumerable<UserForDetailsDto>>(users);
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
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
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
    }
}