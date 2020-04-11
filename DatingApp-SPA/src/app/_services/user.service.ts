import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';

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

  getMessages(id: number, pageNumber?, pageSize?, messageContainer?): Observable<PaginatedResult<Message[]>> {

    const customParams: { key: string, value: string }[] = [];

    if (messageContainer != null) {

      customParams.push({ key: 'messageContainer', value: messageContainer });
    }

    const result = this.http.getPaginatedResults<Message[]>(`${this.baseUrl}${id}/messages`, pageNumber, pageSize, customParams);
    return result;
  }

  getMessageThread(senderId: number, recipientId: number): Observable<Message[]> {

    const result = this.http.get<Message[]>(`${this.baseUrl}${senderId}/messages/thread/${recipientId}`);
    return result;
  }

  sendMessage(senderId: number, message: Message): Observable<Message> {

    const result = this.http.post<Message>(`${this.baseUrl}${senderId}/messages/`, message);
    return result;
  }

  deleteMessage(userId: number, messageId: number): Observable<Message> {

    const result = this.http.post<Message>(`${this.baseUrl}${userId}/messages/${messageId}`, {});
    return result;
  }

  markMessageAsRead(userId: number, messagesIds: number[]): Observable<Message> {

    const ids = messagesIds.join(',');
    return this.http.post<Message>(`${this.baseUrl}${userId}/messages/read/${ids}`, {});

  }

}
