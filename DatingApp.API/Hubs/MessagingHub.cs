using DatingApp.API.Dtos;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DatingApp.API.Hubs
{
    public class MessagingHub:Hub
    {
        public async Task Send(MessageToReturnDto msg)
        {
            await Clients.Others.SendAsync("new_message", msg);
        }
    }
}
