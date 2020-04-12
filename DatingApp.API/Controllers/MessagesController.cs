using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DatingApp.API.Controllers
{
    //[Authorize] // we use identity and user authenticated policy
    [ApiController]
    [ServiceFilter(typeof(LogUserActivity))]
    [Route("api/users/{userId}/[controller]")]
    public class MessagesController : SharedController
    {
        private readonly IMapper mapper;
        private readonly IDatingRepository datingRepository;

        public MessagesController(IMapper mapper, IDatingRepository datingRepository)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;
        }

        [HttpGet("{messageId}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int messageId)
        {
            if (userId != GetCurrentUserId())
            {
                return Unauthorized();
            }

            var messageFromRepo = await datingRepository.GetMessage(messageId);

            if (messageFromRepo == null)
            {
                return NotFound();
            }

            return Ok(messageFromRepo);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessages(int userId, [FromQuery]MessageParams messageParams)
        {
            if (userId != GetCurrentUserId())
            {
                return Unauthorized();
            }
            messageParams.UserId = userId;
            var messagesFromRepo = await datingRepository.GetMessagesForLoggedInUser(messageParams);
            var messagesToReturn = mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesFromRepo.CurrentPage, messagesFromRepo.PageSize, messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);

            return Ok(messagesToReturn);
        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientId)
        {
            if (userId != GetCurrentUserId())
            {
                return Unauthorized();
            }

            var messagesFromRepo = await datingRepository.GetMessagesThread(userId, recipientId);
            var messagesToReturn = mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            return Ok(messagesToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageForCreationDto messageForCreationDto)
        {
            //we are extracting the sender here to be able to map it with automapper and 
            // Get its info back with the newly created message
            var sender = await datingRepository.GetUser(userId,IsCurrentUser(userId));

            if (sender.Id != GetCurrentUserId())
            {
                return Unauthorized();
            }

            messageForCreationDto.SenderId = userId;

            var recipient = await datingRepository.GetUser(messageForCreationDto.RecipientId,IsCurrentUser(messageForCreationDto.RecipientId));
            if (recipient == null)
            {
                return BadRequest("Could Not find user");
            }

            var message = mapper.Map<Message>(messageForCreationDto);

            datingRepository.Add(message);

            if (await datingRepository.SaveAll())
            {
                var messageToReturn = mapper.Map<MessageToReturnDto>(message);
                return CreatedAtRoute("GetMessage", new { userId, messageId = message.Id }, messageToReturn);
            }

            return BadRequest("Could Not create message");
        }


        [HttpPost("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int userId, int messageId)
        {
            if (userId != GetCurrentUserId())
            {
                return Unauthorized();
            }

            var messageFromRepo = await datingRepository.GetMessage(messageId);

            if (messageFromRepo.SenderId == userId)
            {
                messageFromRepo.SenderDeleted = true;
            }

            if (messageFromRepo.RecipientId == userId)
            {
                messageFromRepo.RecipientDeleted = true;
            }

            if (messageFromRepo.SenderDeleted && messageFromRepo.RecipientDeleted)
            {
                datingRepository.Delete(messageFromRepo);
            }
            if (await datingRepository.SaveAll())
            {
                return NoContent();
            }

            throw new Exception("Error deleting the message !");
        }

        [HttpPost("read/{messagesIds}")]
        public async Task<IActionResult> MarkMessageAsRead(int userId, string messagesIds)
        {
            if (userId != GetCurrentUserId())
            {
                return Unauthorized();
            }

            var msgsIds = messagesIds.Split(',');
            var messagesFromRepo = new List<Message>();

            foreach (var msgId in msgsIds)
            {
                var messageFromRepo = await datingRepository.GetMessage(int.Parse(msgId));

                if (messageFromRepo.RecipientId != userId)
                {
                    return Unauthorized();// a user can only mark messages he recieved as read
                }
                messageFromRepo.IsRead = true;
                messageFromRepo.ReadOn = DateTime.Now;
                messagesFromRepo.Add(messageFromRepo);
            }

            if (await datingRepository.SaveAll())
            {
                return NoContent();
            }

            throw new Exception("Error Mark Read message !");
        }


    }
}