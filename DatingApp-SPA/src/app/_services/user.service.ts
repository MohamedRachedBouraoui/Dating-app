import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = 'users/';

  constructor(private http: HttpService) { }

  getUsers(pageNumber?: number, pageSize?: number, userParams?, likesParams?: string): Observable<PaginatedResult<User[]>> {

    const customParams: { key: string, value: string }[] = [];
    if (userParams != null) {

      customParams.push({ key: 'minAge', value: userParams.minAge.toString() });
      customParams.push({ key: 'maxAge', value: userParams.maxAge.toString() });
      customParams.push({ key: 'gender', value: userParams.gender.toString() });
      customParams.push({ key: 'orderBy', value: userParams.orderBy.toString() });
    }

    if (likesParams != null) { // likesParams can be 'likers' or 'likees'
      customParams.push({ key: likesParams, value: 'true' });
    }

    const result = this.http.getPaginatedResults<User[]>(this.baseUrl, pageNumber, pageSize, customParams);
    return result;
  }

  getUser(userId: number): Observable<User> {

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

  sendLike(userId: number, likeeId: number) {
    return this.http.post(this.baseUrl + `${userId}/like/${likeeId}`, {});
  }

}
