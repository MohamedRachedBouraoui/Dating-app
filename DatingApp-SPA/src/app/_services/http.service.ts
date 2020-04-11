import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class HttpService {


  baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  post<T>(url: string, data: any): Observable<T> {
    return this.httpClient.post<any>(this.baseUrl + url, data);
  }

  get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + url);
  }

  getPaginatedResults<T>(url: string, pageNumber?: number, pageSize?: number, customHttpParams?: { key: string, value: string }[])
    : Observable<PaginatedResult<T>> {

    let params = new HttpParams();
    if (pageNumber != null) {
      params = params.append('pageNumber', pageNumber.toString());
    }
    if (pageSize != null) {
      params = params.append('pageSize', pageSize.toString());
    }

    if (customHttpParams !== undefined && customHttpParams !== null) {
      customHttpParams.forEach(prm => { params = params.append(prm.key, prm.value); });
    }

    return this.httpClient.get<T>(this.baseUrl + url, { observe: 'response', params })
      .pipe(
        map(response => {
          const paginatedResult = new PaginatedResult<T>();
          paginatedResult.result = response.body; // Exemple: User[]
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
        }
        ));
  }

  put<T>(url: string, data: T): Observable<T> {
    return this.httpClient.put<T>(this.baseUrl + url, data);
  }

  delete<T>(url: string): Observable<any> {
    return this.httpClient.delete<T>(this.baseUrl + url);
  }

}
