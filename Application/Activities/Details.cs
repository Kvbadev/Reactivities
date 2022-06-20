using Domain;
using MediatR;
using Persistence;
using System.Threading.Tasks;

namespace Application.Activities;

public class Details
{
    public class Query : IRequest<Activity>   
    {
        public Guid Id { get; set; }
    }

    public class Handler : IRequestHandler<Query, Activity>
    {
        private readonly DataContext _context;

        public Handler(DataContext context)
        {
            _context = context;
            
        }

        public async Task<Activity> Handle(Query request, CancellationToken cancellationToken)
        {
            if(_context.Activities is not null)
            {
               return await _context.Activities.FindAsync(request.Id); //no content(204) on null
            }
            return null;
        }
    }
}
