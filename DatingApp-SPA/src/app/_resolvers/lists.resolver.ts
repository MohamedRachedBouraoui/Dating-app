import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberResolver } from './member-resolver';

@Injectable({ providedIn: 'root' })
export class ListsResolver extends MemberResolver implements Resolve<User[]> {

  pageNumber = 1;
  pageSize = 3;
  likesParam = 'Likers';

  constructor(injector: Injector) {
    super(injector);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    return this.userService.getUsers(this.pageNumber, this.pageSize, null, this.likesParam)
      .pipe(
        catchError(error => {
          this.alertify.error(error);
          this.router.navigate(['']);
          return of(null);
        })
      );
  }
}
