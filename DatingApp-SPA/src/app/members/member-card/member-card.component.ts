import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {

  @Input() user: User;

  get theUserPhotUrl(): string {

    if (this.user.photoUrl === '') {
      return '../../assets/unknown-user.png';
    } else {
      return this.user.photoUrl;
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
