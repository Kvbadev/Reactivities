using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles;

public class Edit{
    public class Command : IRequest<Result<Unit>?>
    {
        public ProfileDto? ProfileDto {get; set;}
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(p => p.ProfileDto!.DisplayName).NotEmpty();
        }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>?>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _accessor;
        public Handler(DataContext context, IMapper mapper, IUserAccessor accessor)
        {
            _accessor = accessor;
            _mapper = mapper;
            _context = context;
        }

        public async Task<Result<Unit>?> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(p => p.UserName == _accessor.getUsername());
            if(user == null) return null;

            _mapper.Map(request.ProfileDto, user);

            var res = await _context.SaveChangesAsync() > 0;

            if(res) return Result<Unit>.Success(Unit.Value);

            return Result<Unit>.Failure("Could not modify user's properties");
        }
    }
}