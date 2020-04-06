import { Injector } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { JwtService } from '../_services/jwt.service';

export class MemberResolver {

  userService: UserService;
  router: Router;
  alertify: AlertifyService;
  jwtService: JwtService;

  constructor(injector: Injector) {
    this.userService = injector.get(UserService);
    this.router = injector.get(Router);
    this.alertify = injector.get(AlertifyService);
    this.jwtService = injector.get(JwtService);

  }
}
