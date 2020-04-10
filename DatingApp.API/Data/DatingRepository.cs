using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext context;
        public DatingRepository(DataContext context)
        {
            this.context = context;

        }
        public void Add<T>(T entity) where T : class
        {
            context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            context.Remove(entity);
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            var photo = await context.Photos.FirstOrDefaultAsync(ph => ph.UserId == userId && ph.IsMain);
            return photo;
        }

        public async Task<Photo> GetPhoto(int photoId)
        {
            var photo = await context.Photos.FirstOrDefaultAsync(ph => ph.Id == photoId);
            return photo;
        }

        public async Task<User> GetUser(int id)
        {
            var user = await context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);

            return user;
        }

        public async Task<PagedList<User>> GetUSers(UserParams userParams)
        {
            var users = context.Users.Include(u => u.Photos)
                .OrderByDescending(u => u.LastActive).AsQueryable();
            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDateOfBirth = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDateOfBirth = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDateOfBirth && u.DateOfBirth <= maxDateOfBirth);

            }

            if (string.IsNullOrEmpty(userParams.OrderBy)==false)
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        {
                            users = users.OrderByDescending(u => u.Created);
                            break;
                        }
                    default:
                        {
                            users = users.OrderByDescending(u => u.LastActive);
                            break;
                        }
                }
            }
            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}