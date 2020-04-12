using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DatingApp.API.Data
{
    public static class Seed
    {

        public static void SeedUsers(UserManager<User> userManager,RoleManager<Role> roleManager)
        {
            if (userManager.Users.Any())
            {
                return;
            }
            var userDataText = File.ReadAllText(@"Data\UserSeedData.json");

            var users = JsonConvert.DeserializeObject<List<User>>(userDataText);

            // Default roles
            var roles = new List<Role>
            {
                new Role{ Name=MyRoles.ADMIN},
                new Role{ Name=MyRoles.MEMBER},
                new Role{ Name=MyRoles.MODERATOR},
                new Role{ Name=MyRoles.VIP},
            };

            foreach (var role in roles)
            {
                roleManager.CreateAsync(role).Wait();
            }

            foreach (var user in users)
            {
                user.Photos.SingleOrDefault().IsApproved = true;
                userManager.CreateAsync(user,"1234").Wait();
                userManager.AddToRoleAsync(user,"Member");
            }

            //Create admin user
            var adminUser = new User { UserName = "Admin",Gender="Male" };
           var result= userManager.CreateAsync(adminUser, "1234").Result;

            if (result.Succeeded)
            {
                var admin = userManager.FindByNameAsync("Admin").Result;
                userManager.AddToRolesAsync(admin, roles.Select(r=>r.Name));
            }


        }
        //public static void SeedUsers(this DataContext context)
        //{
        //    if (context.Users.Any())
        //    {
        //        return;
        //    }
        //    var userDataText = File.ReadAllText(@"Data\UserSeedData.json");

        //    var users = JsonConvert.DeserializeObject<List<User>>(userDataText);


        //    foreach (var user in users)
        //    {
        //        // CreatePassordHash("1234", out byte[] passwordHash, out byte[] passwordSalt);
        //        //user.PasswordHash = passwordHash;
        //        //user.PasswordSalt = passwordSalt;
        //        user.UserName = user.UserName.ToLower();
        //        context.Users.Add(user);
        //    }

        //    context.SaveChanges();
        //}

        //private static void CreatePassordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        //{
        //    using (var hmac = new System.Security.Cryptography.HMACSHA512())
        //    {
        //        passwordSalt = hmac.Key;
        //        passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        //    }
        //}
    }
}