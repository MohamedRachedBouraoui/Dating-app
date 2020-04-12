import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtService } from './jwt.service';
import { environment } from 'src/environments/environment';
import { HttpService } from './http.service';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';
import { isDefined } from '@angular/compiler/src/util';
import { isNullOrUndefined } from 'util';



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
  loggedInUserRoles: Array<string>;

  getLoggedInUserRoles(): Array<string> {


    if (this.loggedInUserRoles === null || this.loggedInUserRoles === undefined) {

      // Role can be a single string or an array of strings
      const rawRoles = this.jwtService.decodeTokenAndRetrieveInfo(JwtService.USER_ROLES);

      if (rawRoles instanceof Array === false) {
        this.loggedInUserRoles = [rawRoles];
      } else {
        this.loggedInUserRoles = rawRoles;
      }
    }

    this.loggedInUserRoles = this.loggedInUserRoles.map(r => r = r.toLowerCase());

    return this.loggedInUserRoles;
  }

  constructor(private http: HttpService,
    private jwtService: JwtService) { }


  changeMemberPhoto(photoUrl: string): void {

    if (photoUrl === undefined || photoUrl === null || photoUrl === '') {
      photoUrl = this.unknownUserPhoto;
    }
    this.photoUrlSubjectBehavior.next(photoUrl);
    this.getLoggedInUser().photoUrl = photoUrl;

    this.storeLoggedInUser(this.getLoggedInUser());
  }


  login(model: any) {
    return this.http.post<any>(this.baseUrl + 'login', model)
      .pipe(
        map((response: any) => {
          if (response) {

            this.jwtService.saveToken(response.token);

            this.storeLoggedInUser(response.user);
            this.loggedInUser = response.user;

            this.changeMemberPhoto(this.loggedInUser.photoUrl);
          }
        })
      );
  }

  storeLoggedInUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
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
    this.loggedInUserRoles = undefined;

    this.jwtService.removeToken();
  }

  roleMatch(allowedRoles: string[]): boolean {

    let matchFound = false;
    const userRoles = this.getLoggedInUserRoles();

    allowedRoles.forEach(role => {
      if (userRoles.includes(role.toLowerCase())) {
        matchFound = true;
        return;
      }
    });
    return matchFound;
  }

}
