import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = 'users/';

  constructor(private http: HttpService) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUser(userId: number): Observable<User> {
    console.log("Logged Output: : UserService -> constructor -> userId", userId);
    return this.http.get<User>(this.baseUrl + userId);
  }

  updateUser(userId: number, user: User): Observable<User> {
    return this.http.put<User>(this.baseUrl + userId, user);
  }

  setUserMainPhoto(userId: number, photoId: number): Observable<User> {
    return this.http.post<User>(this.baseUrl + `${userId}/photos/${photoId}/set-main`, {});
  }

  deletePhoto(userId: number, photoId: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + `${userId}/photos/${photoId}`);
  }

}
