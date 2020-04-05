import { Injector } from '@angular/core';
import { AlertifyService } from './_services/alertify.service';
import { HttpService } from './_services/http.service';

export class BaseComponent {

  protected alertify: AlertifyService;

  constructor(injector: Injector) {
    this.alertify = injector.get(AlertifyService);

  }
}
