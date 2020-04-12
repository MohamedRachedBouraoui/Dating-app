import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = environment.apiUrl + 'admin/';

  constructor(private httpClient: HttpClient) { }

  getUsersWithRoles() {
    return this.httpClient.get(this.baseUrl + 'usersWithRoles');
  }

  updateUserRoles(userName: string, newRoles: string[]): Observable<string[]> {
    return this.httpClient.post<string[]>(this.baseUrl + 'editRoles/' + userName, { roleNames: newRoles });
  }

  getPhotosForApproval() {
    return this.httpClient.get(this.baseUrl + 'photosForModeration');
  }

  approvePhoto(photoId) {
    return this.httpClient.post(this.baseUrl + 'approvePhoto/' + photoId, {});
  }


  rejectPhoto(photoId) {
    return this.httpClient.post(this.baseUrl + 'rejectPhoto/' + photoId, {});
  }

}
