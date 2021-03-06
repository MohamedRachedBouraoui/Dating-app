import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberResolver } from './member-resolver';

@Injectable({ providedIn: 'root' })
export class MemberDetailsResolver extends MemberResolver implements Resolve<User> {

  constructor(injector: Injector) {
    super(injector);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    const userId = +route.params.id;
    return this.userService.getUser(userId)
      .pipe(
        catchError(error => {
          this.alertify.error(error);
          this.router.navigate(['']);
          return of(null);
        })
      );
  }
}
