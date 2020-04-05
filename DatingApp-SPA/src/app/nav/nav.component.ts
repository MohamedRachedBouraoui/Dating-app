import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  get loggedInUserName(): string {
    return this.authService.getLoggedInUserName()
  };

  constructor(private authService: AuthService,
    private alertifyService: AlertifyService) { }

  ngOnInit() {

  }

  login(): void {

    this.authService.login(this.model).subscribe(
      next => {
        this.alertifyService.success('Logged in.');
      },
      error => {
        this.alertifyService.error(error);
      });
  }

  logout(): void {
    this.authService.logout();
    this.alertifyService.message('Logged out');
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
