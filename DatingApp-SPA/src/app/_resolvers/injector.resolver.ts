import { Injectable, Injector } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberResolver } from './member-resolver';

@Injectable({ providedIn: 'root' })
export class InjectorResolver extends MemberResolver implements Resolve<Injector> {

  constructor(private injector: Injector) {
    super(injector);
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Injector> {
    return of(this.injector);
  }
}
