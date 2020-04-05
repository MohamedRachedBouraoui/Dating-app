import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";
import { JwtService } from './jwt.service';
import { environment } from 'src/environments/environment';
import { HttpService } from './http.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'auth/';

  loggedInUserName: string;

  constructor(private http: HttpService,
    private jwtService: JwtService) { }

  login(model: any) {
    return this.http.post<any>(this.baseUrl + 'login', model)
      .pipe(
        map((response: any) => {
          if (response) {
            this.jwtService.saveToken(response.token);
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
    if (this.loggedInUserName) {
      return this.loggedInUserName;
    }

    this.loggedInUserName = this.jwtService.decodeTokenAndRetrieveInfo(JwtService.UNIQUE_NAME);
    return this.loggedInUserName;
  }

  logout() {
    this.loggedInUserName = '';
    this.jwtService.removeToken();
  }
}
