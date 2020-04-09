using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace DatingApp.API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next(); //after execution

            var userId = int.Parse(resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var datingRepo = resultContext.HttpContext.RequestServices.GetService<IDatingRepository>();

            var user = await datingRepo.GetUser(userId);
            user.LastActive = DateTime.Now;
            await datingRepo.SaveAll();
        }
    }
}