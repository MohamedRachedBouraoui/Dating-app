import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtService } from './jwt.service';
import { environment } from 'src/environments/environment';
import { HttpService } from './http.service';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'auth/';

  loggedInUserName: string;
  loggedInUser: User;

  readonly unknownUserPhoto = '../../assets/unknown-user.png';

  photoUrlSubjectBehavior = new BehaviorSubject<string>(this.unknownUserPhoto);
  currentPhotoUrl = this.photoUrlSubjectBehavior.asObservable();

  constructor(private http: HttpService,
    private jwtService: JwtService) { }


  changeMemeberPhoto(photoUrl: string): void {
    if (photoUrl === undefined || photoUrl === null || photoUrl === '') {
      photoUrl = this.unknownUserPhoto;
    }
    this.photoUrlSubjectBehavior.next(photoUrl);
    this.getLoggedInUser().photoUrl = photoUrl;

    localStorage.setItem('user', JSON.stringify(this.getLoggedInUser()));
  }


  login(model: any) {
    return this.http.post<any>(this.baseUrl + 'login', model)
      .pipe(
        map((response: any) => {
          if (response) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.jwtService.saveToken(response.token);
            this.loggedInUser = response.user;
            this.changeMemeberPhoto(this.loggedInUser.photoUrl);
          }
        })

      );
  }

  register(model: any) {
    return this.http.post<any>(this.baseUrl + 'register', model);
  }

  isLoggedIn(): boolean {
    return this.jwtService.isTokenExpired() === false;
  }

  getLoggedInUserName(): string {
    if (!this.loggedInUserName) {
      this.loggedInUserName = this.jwtService.decodeTokenAndRetrieveInfo(JwtService.UNIQUE_NAME);
    }
    return this.loggedInUserName;
  }

  getLoggedInUser(): User {
    if (!this.loggedInUser) {
      this.loggedInUser = JSON.parse(localStorage.getItem('user'));
    }
    return this.loggedInUser;
  }

  logout() {
    this.loggedInUserName = '';
    this.jwtService.removeToken();
  }
}
