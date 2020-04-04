import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { error } from 'protractor';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req)
      .pipe(
        catchError(comingError => {
          if (comingError.status === 401) {
            return throwError(comingError.statusText);
          }
          if (comingError instanceof HttpErrorResponse) {
            const applicationError = comingError.headers.get('Application-Error');
            if (applicationError) {
              return throwError(applicationError);
            }

            const serverError = comingError.error;
            const serverErrorArray = serverError.errors;

            let modelStateErrors = '';
            if (serverErrorArray && typeof serverErrorArray === 'object') {
              for (const key in serverErrorArray) {
                if (serverErrorArray.hasOwnProperty(key)) {
                  const element = serverErrorArray[key];
                  modelStateErrors += element + '\n';
                }
              }
            }
            return throwError(modelStateErrors || serverError || 'Server Error');
          }
        })
      );
  }
}
