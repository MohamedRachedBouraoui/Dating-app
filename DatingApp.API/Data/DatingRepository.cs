using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

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

        public async Task<Like> GetLike(int likerId, int likeeId)
        {
            var like = await context.Likes.FirstOrDefaultAsync(u => u.LikerId == likerId && u.LikeeId == likeeId);

            return like;
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            var photo = await context.Photos.FirstOrDefaultAsync(ph => ph.UserId == userId && ph.IsMain);
            return photo;
        }

        public async Task<Message> GetMessage(int messageId)
        {
            return await context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
        }

        public async Task<PagedList<Message>> GetMessagesForLoggedInUser(MessageParams messageParams)
        {
            //context.Filter<Post>(q => q.Where(x => !x.IsSoftDeleted));
            var messages = context.Messages.AsQueryable();//.Filter<Photo>(q => q.Where(x => x.IsMain));

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    {
                        messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.RecipientDeleted == false);
                        break;
                    }
                case "Outbox":
                    {
                        messages = messages.Where(u => u.SenderId == messageParams.UserId && u.SenderDeleted == false);
                        break;
                    }

                default:
                    {
                        messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.IsRead == false && u.RecipientDeleted == false);

                        break;
                    }
            }

            messages = messages.OrderByDescending(m => m.SentOn);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessagesThread(int userId, int recipientId)
        {
            var messages = await context.Messages
                .Where(
                u => (u.RecipientId == userId && u.RecipientDeleted == false && u.SenderId == recipientId)
                   || (u.RecipientId == recipientId && u.SenderId == userId && u.SenderDeleted == false)
                )
                .OrderByDescending(m => m.SentOn)
                .ToListAsync();

            return messages;
        }

        public async Task<Photo> GetPhoto(int photoId)
        {
            var photo = await context.Photos.IgnoreQueryFilters().FirstOrDefaultAsync(ph => ph.Id == photoId);
            return photo;
        }

        public async Task<int> GetUnreadMessagesForLoggedInUser(int userId)
        {
            var unreadMsgCount= await context.Messages
                .Where(u => u.RecipientId == userId  && u.IsRead == false && u.RecipientDeleted == false)
                .OrderByDescending(m => m.SentOn)
                .CountAsync();

            return unreadMsgCount;
        }

        public async Task<User> GetUser(int id,bool isCurrentUser)
        {

            var query = context.Users.Where(u => u.Id == id).Include(u => u.Photos).AsQueryable();

            if (isCurrentUser)
            {
                query = query.IgnoreQueryFilters();
            }

            var user = await query.FirstOrDefaultAsync();

            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = context.Users.OrderByDescending(u => u.LastActive).AsQueryable();
            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }
            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDateOfBirth = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDateOfBirth = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDateOfBirth && u.DateOfBirth <= maxDateOfBirth);

            }

            if (string.IsNullOrEmpty(userParams.OrderBy) == false)
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


        private async Task<IEnumerable<int>> GetUserLikes(int userId, bool likers)
        {
            var user = await context.Users .FirstOrDefaultAsync(u => u.Id == userId);


            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == userId).Select(u => u.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == userId).Select(u => u.LikeeId);
            }
        }
    }
}