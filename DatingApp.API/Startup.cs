using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Hubs;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Net;
using System.Text;

namespace DatingApp.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }


        // public void ConfigureDevelopmentServices(IServiceCollection services) //RBO: named by convention of ASP-Core
        // {
        //     System.Diagnostics.Debug.WriteLine("ConfigureDevelopmentServices");
        //     services.AddDbContext<DataContext>(options =>
        //                 {
        //                     options.UseLazyLoadingProxies(true);
        //                     options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
        //                 });
        //     ConfigureServices(services);
        // }

        // public void ConfigureProductionServices(IServiceCollection services) //RBO: named by convention of ASP-Core                    
        // {
        //     System.Diagnostics.Debug.WriteLine("ConfigureDevelopmentServices");
        //     services.AddDbContext<DataContext>(options =>
        //     {
        //         options.UseLazyLoadingProxies(true);
        //         options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
        //     });
        //     ConfigureServices(services);
        // }

        public void ConfigureServices(IServiceCollection services)
        {
            ConfigureCors(services);

            ConfigureIdentity(services);
            ConfigureAuthentication(services);
            ConfigureAuthorization(services);

            ConfigureDbContext(services);
            ConfigureRepositories(services);

            services.AddScoped<LogUserActivity>();

            ConfigureControllersNewtonsoftJson(services);

            ConfigureAutoMapper(services);

            ConfigureCloudinary(services);

            ConfigureSignlR(services);
        }

        private static void ConfigureCors(IServiceCollection services)
        {
            //services.AddCors();
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", builder => builder
                .WithOrigins("http://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
            });
        }

        private void ConfigureSignlR(IServiceCollection services)
        {
            services.AddSignalR();
        }

        private void ConfigureAuthorization(IServiceCollection services)
        {
            services.AddAuthorization(opt =>
            {
                opt.AddPolicy(MyPolicies.REQUIERE_ADMIN_ROLE,policy=>policy.RequireRole(MyRoles.ADMIN ));
                opt.AddPolicy(MyPolicies.REQUIERE_MODERATE_PHOTO_ROLE,policy=>policy.RequireRole(MyRoles.ADMIN, MyRoles.MODERATOR));
                opt.AddPolicy(MyPolicies.REQUIEREMEMBERROLE,policy=>policy.RequireRole(MyRoles.MEMBER));
                opt.AddPolicy(MyPolicies.VIPONLY,policy=>policy.RequireRole(MyRoles.VIP));
            });
        }

        private void ConfigureCloudinary(IServiceCollection services)
        {
            services.Configure<CloudinarySettings>(Configuration.GetSection("CloudinarySettings"));
        }

        private static void ConfigureAutoMapper(IServiceCollection services)
        {
            services.AddAutoMapper(typeof(DatingRepository).Assembly);
        }

        private void ConfigureAuthentication(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration.GetSection("AppSettings:Token").Value)),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            }
           );
        }

        private static void ConfigureRepositories(IServiceCollection services)
        {
            //services.AddScoped<IAuthRepository, AuthRepository>(); //NOT NEEDED ANY MORE
            services.AddScoped<IDatingRepository, DatingRepository>();
        }

        private static void ConfigureControllersNewtonsoftJson(IServiceCollection services)
        {
            services.AddControllers(opts =>
            {
                //To requiere Authentication By default to every Single method, so we have to allow Anonymous for Login & Register  methods & SpaFallbackController
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
                opts.Filters.Add(new AuthorizeFilter(policy));

            }).AddNewtonsoftJson(opt =>
            {
                opt.SerializerSettings.ReferenceLoopHandling =
                 Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            });
        }

        private void ConfigureDbContext(IServiceCollection services)
        {
            services.AddDbContext<DataContext>(options =>
            {
                options.UseLazyLoadingProxies(true);
                options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
            });
        }

        private static void ConfigureIdentity(IServiceCollection services)
        {
            IdentityBuilder builder = services.AddIdentityCore<User>(opt =>//just to be able to use dummy passwords in our tuto
            {
                opt.Password.RequireDigit = false;
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
                opt.Password.RequiredLength = 4;
                opt.Password.RequireLowercase = false;

            });

            //Adding services to Identity
            builder = new IdentityBuilder(builder.UserType, typeof(Role), builder.Services);
            builder.AddEntityFrameworkStores<DataContext>();// To create all needed tables by Identity
            builder.AddRoleValidator<RoleValidator<Role>>();  //We will implement roles 
            builder.AddRoleManager<RoleManager<Role>>();
            builder.AddSignInManager<SignInManager<User>>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(builder =>
                builder.Run(async ctx =>
                {
                    ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                    var error = ctx.Features.Get<IExceptionHandlerFeature>();
                    if (error != null)
                    {
                        ctx.Response.AddApplicationError(error.Error.Message);
                        await ctx.Response.WriteAsync(error.Error.Message);
                    }
                })
                );
            }

            // app.UseHttpsRedirection();

            app.UseRouting();

           /// app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            app.UseCors("CorsPolicy");

            app.UseAuthentication();

            app.UseAuthorization();


            app.UseStaticFiles();
            app.UseDefaultFiles(); //exple: index.html

            

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<MessagingHub>("/messaging");
            //endpoints.MapFallbackToController("Index", "SpaFallback");
            // if the request URL is not for our api then route to index action in SpaFallbackController
        });
            //handle client side routes
            //app.Run(async (context) =>
            //{
            //    //context.Response.ContentType = "text/html";
            //    await context.Response.SendFileAsync(Path.Combine(env.WebRootPath, "index.html"));
            //});
        }
    }
}
