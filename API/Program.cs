using Persistence;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Application.Activities;
using Application.Core;
using Domain;
using FluentValidation.AspNetCore;
using API.MIddleware;
using Microsoft.AspNetCore.Identity;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Infrastructure.Security;
using Application.Interfaces;
using Infrastructure.Photos;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//

//Cors policy
builder.Services.AddCors(opt => {
    opt.AddPolicy("CorsPolicy", policy => {
        policy.AllowAnyMethod().AllowAnyHeader().WithOrigins("http://localhost:3000");
    });
});

//Database
builder.Services.AddDbContext<DataContext>(opt => 
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

//MediatR
builder.Services.AddMediatR(typeof(List.Handler).Assembly);

//Auto Mapper
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);

builder.Services.AddControllers(opt => {
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build(); //ensures that every single endpoint requires authentication
    opt.Filters.Add(new AuthorizeFilter(policy));
});

builder.Services.AddScoped<IUserAccessor, UserAccessor>();

//Fluent validation
builder.Services.AddFluentValidation(config => {
    config.RegisterValidatorsFromAssemblyContaining<Create>();
});

//Identity
builder.Services.AddIdentityCore<AppUser>(opt => {
    opt.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<DataContext>()
    .AddSignInManager<SignInManager<AppUser>>();

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["TokenKey"]));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddScoped<TokenService>(); //scoped - lifetime as long as http request

builder.Services.AddAuthorization(opt => {
    opt.AddPolicy("IsActivityHost", policy => {
        policy.Requirements.Add(new IsHostRequirement());
    });
});
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));

builder.Services.AddScoped<IPhotoAccessor, PhotoAccessor>();


var app = builder.Build();

//seed the data in the database if it does not exist yet
using (var scope = app.Services.CreateScope()) //Dispose() method ends the scope lifetime, that method is invoked when using scope ends
{
    try{
        var context = scope.ServiceProvider.GetRequiredService<DataContext>(); //as soon as program consumes this scope, variables're gonna be disposed
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        await context.Database.MigrateAsync();
        await Seed.SeedData(context, userManager);
    } 
    catch(Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occured during migration");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors("CorsPolicy");

app.MapControllers();

await app.RunAsync();
