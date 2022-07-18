using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles;

public class ActivitiesList 
{
    public class Query : IRequest<Result<List<UserActivityDto>>?>
    {
        public string? Predicate { get; set; }
        public string? Username { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>?>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public Handler(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<Result<List<UserActivityDto>>?> Handle(Query request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == request.Username);
            if(user == null) return null;

            var query = _context.Activities!
                .Where(x => x.Attendees!.Any(f => f.AppUser!.UserName == request.Username))
                .OrderBy(d => d.Date)
                .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                .AsQueryable();

            if(request.Predicate == "past")
            {
                query = query.Where(x => x.Date < DateTime.UtcNow);
            }
            else if(request.Predicate == "future")
            {
                query = query.Where(x => x.Date > DateTime.UtcNow);
            }
            else if(request.Predicate == "hosting")
            {
                query = query.Where(x => x.HostUsername == request.Username);
            }

            return Result<List<UserActivityDto>>.Success(new List<UserActivityDto>(await query.ToListAsync()));
        }
    }
}