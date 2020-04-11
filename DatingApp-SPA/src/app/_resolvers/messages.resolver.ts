import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberResolver } from './member-resolver';
import { Message } from '../_models/message';

@Injectable({ providedIn: 'root' })
export class MessagesResolver extends MemberResolver implements Resolve<Message[]> {

  pageNumber = 1;
  pageSize = 3;
  messageContainer = 'Unread';

  constructor(injector: Injector) {
    super(injector);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Message[]> {
    const userId = this.authService.getLoggedInUser().id;

    return this.userService.getMessages(userId, this.pageNumber, this.pageSize, this.messageContainer)
      .pipe(
        catchError(error => {
          this.alertify.error(error);
          this.router.navigate(['']);
          return of(null);
        })
      );
  }
}
