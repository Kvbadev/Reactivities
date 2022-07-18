using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProfilesController : BaseApiController
{
    [HttpGet("{username}")]
    public async Task<IActionResult> GetProfile(string username)
    {
        return HandleResult(await Mediator!.Send(new Details.Query{Username = username}));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(ProfileDto profileDto)
    {
        return HandleResult(await Mediator!.Send(new Edit.Command{ProfileDto = profileDto}));
    }

    [HttpGet("{username}/activities")]
    public async Task<IActionResult> GetProfileActivities([FromQuery]string? predicate, string username)
    {
        return HandleResult(await Mediator!.Send(new ActivitiesList.Query{Predicate = predicate, Username = username}));
    }
}
