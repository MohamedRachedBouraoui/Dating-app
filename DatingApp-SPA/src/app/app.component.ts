import { Component, OnInit, Injector } from '@angular/core';
import { BaseComponent } from './base-component';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseComponent implements OnInit {

  title = 'DatingApp-SPA';

  constructor(private injector: Injector) {
    super(injector);

  }
  ngOnInit(): void {

    const user: User = this.authService.getLoggedInUser();
    if (user) {
      this.authService.changeMemberPhoto(user.photoUrl);
    }
  }

}
