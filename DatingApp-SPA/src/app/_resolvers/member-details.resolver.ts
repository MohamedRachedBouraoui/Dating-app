import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MemberDetailsResolver implements Resolve<User> {

  constructor(private userService: UserService,
    private router: Router,
    private alertify: AlertifyService) {
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
