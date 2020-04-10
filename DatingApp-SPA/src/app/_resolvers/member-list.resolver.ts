import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberResolver } from './member-resolver';

@Injectable({ providedIn: 'root' })
export class MemberListResolver extends MemberResolver implements Resolve<User[]> {

  pageNumber = 1;
  pageSize = 3;
  constructor(injector: Injector) {
    super(injector);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    return this.userService.getUsers(this.pageNumber, this.pageSize)
      .pipe(
        catchError(error => {
          this.alertify.error(error);
          this.router.navigate(['']);
          return of(null);
        })
      );
  }
}
