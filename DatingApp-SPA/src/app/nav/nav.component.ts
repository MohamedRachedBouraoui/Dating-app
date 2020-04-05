import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

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
    private alertifyService: AlertifyService,
    private router: Router) { }

  ngOnInit() {
  }

  login(): void {

    this.authService.login(this.model).subscribe(
      next => {
        this.alertifyService.success('Logged in.');
      },
      error => {
        this.alertifyService.error(error);
      },
      () => {
        this.router.navigate(['/members']);
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.alertifyService.message('Logged out');
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
