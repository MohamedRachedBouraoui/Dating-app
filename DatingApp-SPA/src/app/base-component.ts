import { Injector } from '@angular/core';
import { AlertifyService } from './_services/alertify.service';
import { HttpService } from './_services/http.service';
import { ActivatedRoute } from '@angular/router';
import { JwtService } from './_services/jwt.service';

export class BaseComponent {

  alertify: AlertifyService;
  activatedRoute: ActivatedRoute;
  jwtService: JwtService;

  constructor(injector: Injector) {
    this.activatedRoute = injector.get(ActivatedRoute);
    this.alertify = injector.get(AlertifyService);
    this.jwtService = injector.get(JwtService);

  }
}
