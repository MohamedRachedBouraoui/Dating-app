

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
       // private readonly IAuthRepository authRepository; //NOT NEEDED ANY MORE
        private readonly IConfiguration configuration;
        private readonly IMapper mapper;
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        public AuthController( IConfiguration configuration, IMapper mapper
            , UserManager<User> userManager, SignInManager<User> signInManager
            //, IAuthRepository authRepository
            )
        {
            this.mapper = mapper;
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.configuration = configuration;
            //this.authRepository = authRepository; 
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDto)
        {
            //userForRegisterDto.UserName = userForRegisterDto.UserName.ToLower();

            //if (await authRepository.UserExists(userForRegisterDto.UserName))
            //{
            //    return BadRequest("Username already exists !!!");
            //}

            var userToCreate = mapper.Map<User>(userForRegisterDto);

            var userCreationResult = await userManager.CreateAsync(userToCreate, userForRegisterDto.Password);

            // var createdUser = await authRepository.Register(userToCreate, userForRegisterDto.Password);

            if (userCreationResult.Succeeded)
            {
                var userToReturn = mapper.Map<UserForDetailsDto>(userToCreate);
                return CreatedAtRoute("GetUser", new { Controller = "Users", id = userToCreate.Id }, userToReturn);
            }

            return BadRequest(userCreationResult.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {
             var loggedInUuser = await userManager.FindByNameAsync(userForLoginDto.UserName);

            var result = await signInManager.CheckPasswordSignInAsync(loggedInUuser, userForLoginDto.Password, false);

            if (result.Succeeded == false)
            {
                return Unauthorized();
            }

            //  var userFromRepo = await authRepository.Login(userForLoginDto.UserName.ToLower(), userForLoginDto.Password);
            //if (userFromRepo == null)
            //{
            //    return Unauthorized();
            //}

            var user = mapper.Map<UserForListDto>(loggedInUuser);
            var token = CreateToken(loggedInUuser).Result;


            return Ok(new
            {
                user,
                token
            });
        }

        private async Task<string> CreateToken(User userFromRepo)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier,userFromRepo.Id.ToString()),
                new Claim(ClaimTypes.Name,userFromRepo.UserName)
            };

            var userRoles = await userManager.GetRolesAsync(userFromRepo);

            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}