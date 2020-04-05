import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  post<T>(url: string, data: any): Observable<T> {
    return this.httpClient.post<any>(this.baseUrl + url, JSON.stringify(data));
  }

  get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + url);
  }


}
