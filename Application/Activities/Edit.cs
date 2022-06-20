using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities;

public class Edit
{
    public class Command : IRequest   
    {
        public Activity? Activity {get; set;}
    }

    public class Handler : IRequestHandler<Command>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public Handler(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
        {
            if(_context.Activities is not null && request.Activity is not null)
            {
                var activity = await _context.Activities.FindAsync(request.Activity.Id);

                if(activity is not null)
                {
                    _mapper.Map(request.Activity, activity);
                    
                    await _context.SaveChangesAsync();
                }
            }
            return Unit.Value;
        }
    }
}
