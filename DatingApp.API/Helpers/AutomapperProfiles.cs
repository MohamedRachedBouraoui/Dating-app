using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutomapperProfiles : Profile
    {
        public AutomapperProfiles()
        {
            CreateMap<User, UserForListDto>()
             .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.Photos.Count > 0 ? src.Photos.First(p => p.IsMain).Url : string.Empty))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<User, UserForDetailsDto>()
            .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.Photos.Count > 0 ? src.Photos.First(p => p.IsMain).Url : string.Empty))
             .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<UserForUpdateDto, User>();
            CreateMap<UserForRegisterDto, User>();

            CreateMap<Photo, PhotoForDetailsDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<Photo, PhotoForReturnDto>();
        }

    }
}