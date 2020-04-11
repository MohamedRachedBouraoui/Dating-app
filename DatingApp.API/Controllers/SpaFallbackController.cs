using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace DatingApp.API.Controllers
{
    public class SpaFallbackController : Controller
    {
        public SpaFallbackController()
        {
        }

        public IActionResult Index()
        {
            string wwwrootPhysicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
            return base.PhysicalFile(wwwrootPhysicalPath, "text/html");
        }
    }
}