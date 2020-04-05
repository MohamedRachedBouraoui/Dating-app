import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  static UNIQUE_NAME = 'unique_name';

  get token(): any {
    return localStorage.getItem('token');
  }

  jwtHelper = new JwtHelperService();

  constructor() { }

  saveToken(token: any): void {
    localStorage.setItem('token', token);
  }

  decodeTokenAndRetrieveInfo(infoToRetrieve: any): any {
    if (this.token) {
      return this.jwtHelper.decodeToken(this.token)[infoToRetrieve];
    }
    return '';
  }

  isTokenExpired(): boolean {
    return this.jwtHelper.isTokenExpired(this.token);
  }
  removeToken() {
    localStorage.removeItem('token');
  }
}

export function getToken(): any {
  return localStorage.getItem('token');
}
