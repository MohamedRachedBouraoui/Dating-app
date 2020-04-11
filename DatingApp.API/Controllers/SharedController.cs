using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DatingApp.API.Controllers
{
    public class SharedController: ControllerBase
    {

        protected bool CheckIfUserIsLogged(int id)
        {
            return id == GetCurrentUserId();
        }

        protected int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        }

    }
}