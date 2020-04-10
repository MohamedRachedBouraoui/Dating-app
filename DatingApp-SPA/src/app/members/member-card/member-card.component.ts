import { Component, OnInit, Input, Injector } from '@angular/core';
import { User } from 'src/app/_models/user';
import { BaseComponent } from 'src/app/base-component';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent extends BaseComponent implements OnInit {

  @Input() user: User;

  get theUserPhotUrl(): string {

    if (this.user.photoUrl === '') {
      return '../../assets/unknown-user.png';
    } else {
      return this.user.photoUrl;
    }
  }
  constructor(private injector: Injector,
    private userService: UserService) {
    super(injector);
  }

  ngOnInit() {

  }
  sendLike(likeeId: number): void {
    const likerId = this.authService.getLoggedInUser().id;
    this.userService.sendLike(likerId, likeeId).subscribe(response => {
      this.alertify.success('Now You like: ' + this.user.knownAs);
    }, error => {
      this.alertify.error(error);
    });
  }

}
