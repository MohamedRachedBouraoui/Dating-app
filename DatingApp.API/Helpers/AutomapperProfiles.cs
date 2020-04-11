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
            #region User Mapping
            CreateMap<User, UserForListDto>()
              .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.Photos.Count > 0 ? src.Photos.First(p => p.IsMain).Url : string.Empty))
             .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<User, UserForDetailsDto>()
            .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.Photos.Count > 0 ? src.Photos.First(p => p.IsMain).Url : string.Empty))
             .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<UserForUpdateDto, User>();
            CreateMap<UserForRegisterDto, User>();
            #endregion

            #region Photo Mapping
            CreateMap<Photo, PhotoForDetailsDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<Photo, PhotoForReturnDto>();
            #endregion


            #region Message Mapping
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
            CreateMap<Message, MessageToReturnDto>()
                .ForMember(dest => dest.SenderPhotoUrl, opt => opt.MapFrom(src => src.Sender.Photos.Count > 0 ? src.Sender.Photos.First(p => p.IsMain).Url : string.Empty))
                .ForMember(dest => dest.RecipientPhotoUrl, opt => opt.MapFrom(src => src.Recipient.Photos.Count > 0 ? src.Recipient.Photos.First(p => p.IsMain).Url : string.Empty));
            #endregion
        }

    }
}