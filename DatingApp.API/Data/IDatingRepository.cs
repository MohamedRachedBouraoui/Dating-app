using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUSers(UserParams userParams);
        Task<User> GetUser(int id);
        Task<Photo> GetPhoto(int photoId);
        Task<Photo> GetMainPhotoForUser(int userId);
        Task<Like> GetLike(int likerId, int likeeId);

        //Messages
        Task<Message> GetMessage(int messageId);
        Task<PagedList<Message>> GetMessagesForLoggedInUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessagesThread(int userId,int recipientId);
    }
}