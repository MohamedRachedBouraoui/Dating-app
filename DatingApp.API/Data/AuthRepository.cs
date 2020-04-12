using System;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace DatingApp.API.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DataContext context;
        public AuthRepository(DataContext context)
        {
            this.context = context;

        }

        public async Task<User> Login(string userName, string password)
        {
            var user = await context.Users.IncludeFilter(u => u.Photos.Where(p => p.IsMain)).FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return null;
            }

            //if (VerifyPasswordHash(user, password) == false)
            //{
            //    return null;
            //}
            return user;

        }

        //private bool VerifyPasswordHash(User user, string password)
        //{
        //    byte[] computedPasswordHash = ComputePasswordHash(user.PasswordSalt, password);


        //    if (computedPasswordHash.Length != user.PasswordHash.Length)
        //    {
        //        return false;
        //    }

        //    for (int i = 0; i < computedPasswordHash.Length; i++)
        //    {
        //        if (user.PasswordHash[i] != computedPasswordHash[i])
        //        {
        //            return false;
        //        }
        //    }
        //    return true;

        //}

        //private byte[] ComputePasswordHash(byte[] passwordSalt, string password)
        //{
        //    byte[] computedPasswordHash = null;
        //    using (var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt))
        //    {
        //        computedPasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        //    }
        //    return computedPasswordHash;
        //}

        public async Task<User> Register(User user, string password)
        {
            //byte[] passwordHash, passwordSalt;
            //CreatePasswordHashAndSalt(password, out passwordHash, out passwordSalt);
            //user.PasswordHash = passwordHash;
            //user.PasswordSalt = passwordSalt;

            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            return user;
        }

        //private void CreatePasswordHashAndSalt(string password, out byte[] passwordHash, out byte[] passwordSalt)
        //{
        //    using (var hmac = new System.Security.Cryptography.HMACSHA512())
        //    {
        //        passwordSalt = hmac.Key;
        //        passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        //    }
        //}

        public async Task<bool> UserExists(string userName)
        {
            return await context.Users.AnyAsync(u => u.UserName == userName);
        }
    }
}