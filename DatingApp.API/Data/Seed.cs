using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DatingApp.API.Models;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public static class Seed
    {
        public static void SeedUsers(this DataContext context)
        {
            if (context.Users.Any())
            {
                return;
            }

            var userDataText = File.ReadAllText(@"Data\UserSeedData.json");

            var users = JsonConvert.DeserializeObject<List<User>>(userDataText);

            foreach (var user in users)
            {
                byte[] passwordHash, passwordSalt;
                CreatePassordHash("1234", out passwordHash, out passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
                user.UserName = user.UserName.ToLower();
                context.Users.Add(user);
            }

            context.SaveChanges();
        }

        private static void CreatePassordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
    }
}