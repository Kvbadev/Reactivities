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
        public string? Predicate;
    }

    public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>?>
    {
        private readonly IUserAccessor _userAccessor;
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
            _userAccessor = userAccessor;
        }

        public async Task<Result<List<UserActivityDto>>?> Handle(Query request, CancellationToken cancellationToken)
        {

            var query = _context.Activities!
                .Include(a => a.Attendees)!.ThenInclude(u => u.AppUser)
                .Where(x => x.Attendees!.Any(f => f.AppUser!.UserName == _userAccessor.getUsername()))
                .OrderBy(d => d.Date)
                .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider,
                new {currentUsername = _userAccessor.getUsername()})
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
                query = query.Where(x => x.HostUsername == _userAccessor.getUsername());
            }

            return Result<List<UserActivityDto>>.Success(new List<UserActivityDto>(await query.ToListAsync()));

        }
    }
}