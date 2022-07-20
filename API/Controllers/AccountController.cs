namespace API.Controllers;

using System.Security.Claims;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
    public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService, IConfiguration config)
    {
            _config = config;
            this._tokenService = tokenService;
            this._signInManager = signInManager;
            this._userManager = userManager;
            _httpClient = new HttpClient
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.Users.Include(p => p.Photos)
            .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

        if(user == null) return Unauthorized();

        var res = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        if(res.Succeeded)
        {
            return CreateUserObject(user);
        }

        return Unauthorized();
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest("Email taken");
        }
        if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username))
        {
            return BadRequest("Username taken");
        }
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Username
        };

        var res = await _userManager.CreateAsync(user, registerDto.Password);

        if (res.Succeeded)
        {
            return CreateUserObject(user);
        }
        return BadRequest("Problem registering user");
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await _userManager.Users.Include(p => p.Photos)
            .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));
        return CreateUserObject(user!);
    }

    [AllowAnonymous]
    [HttpPost("fbLogin")]
    public async Task<ActionResult<UserDto>> FacebookLogin([FromQuery]string accessToken)
    {
        var fbVerifyKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];

        var verifyToken = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");

        if(!verifyToken.IsSuccessStatusCode) return Unauthorized();

        var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";

        var response = await _httpClient.GetAsync(fbUrl);

        if(!response.IsSuccessStatusCode) return Unauthorized();

        var fbInfo = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());

        var username = (string)fbInfo!.id;

        var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(x => x.UserName == username);

        if(user != null) return CreateUserObject(user); //user is already registered so we're logging them

        user = new AppUser
        {
            DisplayName = (string)fbInfo.name,
            Email = (string)fbInfo.email,
            UserName = (string)fbInfo.id,
            Photos = new List<Photo>{
                new Photo
                {
                    Id = "fb_"+(string)fbInfo.id, 
                    Url=(string)fbInfo.picture.data.url, 
                    IsMain=true
                }
            }
        };

        var result = await _userManager.CreateAsync(user);

        if(!result.Succeeded) return BadRequest("Problem creating user account");

        return CreateUserObject(user);
    }

    private UserDto CreateUserObject(AppUser user)
    {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                Username = user.UserName
            };
    }

}
