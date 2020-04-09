import { Injector } from '@angular/core';
import { AlertifyService } from './_services/alertify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtService } from './_services/jwt.service';
import { AuthService } from './_services/auth.service';

export class BaseComponent {

  alertify: AlertifyService;
  activatedRoute: ActivatedRoute;
  jwtService: JwtService;
  authService: AuthService;
  router: Router;

  constructor(injector: Injector) {
    this.activatedRoute = injector.get(ActivatedRoute);
    this.alertify = injector.get(AlertifyService);
    this.jwtService = injector.get(JwtService);
    this.authService = injector.get(AuthService);
    this.router = injector.get(Router);

  }
}
