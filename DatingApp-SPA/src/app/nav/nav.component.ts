import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};

  constructor(private authService: AuthService) { }

  ngOnInit() {

  }

  login(): void {
    this.authService.login(this.model).subscribe(
      next => {
        console.log('Logged In :=)');
      },
      error => {
        console.log(error);
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    console.log('Logged out :=(o');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

}
