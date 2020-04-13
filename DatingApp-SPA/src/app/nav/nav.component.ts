import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { RealTimeMessagingService } from '../_services/real-time-messaging.service';
import { Message } from '../_models/message';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  newMessages = 0;
  model: any = {};
  photoUrl: string;

  get loggedInUserName(): string {
    return this.authService.getLoggedInUserName();
  }

  get loggedInUserPhotoUrl(): string {
    return this.authService.getLoggedInUser().photoUrl;
  }


  constructor(private authService: AuthService,
    private alertifyService: AlertifyService,
    private userService: UserService,
    private router: Router,
    private realTimeMsgService: RealTimeMessagingService) { }

  ngOnInit() {
    this.authService.photoUrlSubjectBehavior.subscribe((url: string) => {
      this.photoUrl = url;
    });

    this.registerForNewMsg();
  }

  registerForNewMsg() {

    this.realTimeMsgService.onNewMessage().subscribe((msg: Message) => {
      if (msg === null || msg === undefined) {
        return;
      }

      this.newMessages++;
    });
  }

  login(): void {

    this.authService.login(this.model).subscribe(
      next => {
        this.alertifyService.success('Logged in.');
        this.getUnreadMsg();
      },
      error => {
        this.alertifyService.error(error);
      },
      () => {
        this.router.navigate(['/members']);
      });
  }


  getUnreadMsg() {
    this.userService.getUnreadMessagesCount(this.authService.getLoggedInUser().id).subscribe(counter => {
      this.newMessages = counter;
    }, error => {
      this.alertifyService.error(error);
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
