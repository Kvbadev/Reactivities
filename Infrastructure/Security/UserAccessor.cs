using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Security;

public class UserAccessor : IUserAccessor
{
        private readonly IHttpContextAccessor _httpContextAccessor;
    public UserAccessor(IHttpContextAccessor httpContextAccessor)
    {
            _httpContextAccessor = httpContextAccessor;

            var x = _httpContextAccessor.HttpContext!.User;
    }

    public string getUsername()
    {
        return _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.Name);
    }
}
