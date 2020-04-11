using System;

namespace DatingApp.API.Dtos
{
    public class MessageForCreationDto
    {
        public MessageForCreationDto()
        {
            SentOn = DateTime.Now;
        }
        public string Content { get; set; }
        public DateTime? SentOn { get; set; }
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
    }
}
