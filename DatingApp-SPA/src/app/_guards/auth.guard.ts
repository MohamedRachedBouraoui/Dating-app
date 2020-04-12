import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { isDefined } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private activeRouter: ActivatedRoute, private alertify: AlertifyService) {
  }

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    if (isLoggedIn === false) {

      this.alertify.error('Your Not Logged In !');
      this.router.navigate(['/members']);
      return false;
    }

    // Firstchild because this guard is guarding a child route
    // data.roles is set in the app-routing-module
    let allowedRoles = next.firstChild.data.roles as Array<string>;
    if (isDefined(allowedRoles)) {

      //allowedRoles = allowedRoles.map(r => r = r.toLowerCase());

      if (this.authService.roleMatch(allowedRoles) === false) {
        //If not allowed
        this.alertify.error('Your Ara Not Authorised !');
        this.router.navigate(['']); // Redirect to the home page
        return false;
      }

    }
    return true;
  }

}
