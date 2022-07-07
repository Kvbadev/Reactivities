using Application.Activities.Profiles;

namespace Application.Activities;

public class ActivityDto
{
    public Guid Id { get; set; } //if name is 'Id' then it is set as primary key as default

    public string? Title { get; set; }

    public DateTime Date { get; set; }

    public string? Description { get; set; }

    public string? Category { get; set; }

    public string? City { get; set; }

    public string? Venue { get; set; }

    public string? HostUsername { get; set; }

    public bool IsCancelled { get; set; }

    public ICollection<Profile>? Attendees {get; set;}

}