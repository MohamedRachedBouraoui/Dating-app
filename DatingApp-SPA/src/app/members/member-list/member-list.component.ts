import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  users: User[];

  constructor(private alertify: AlertifyService, private userService: UserService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.activatedRoute.data.subscribe(
      (data: any) => {
        this.users = data.users;
      },
      error => {
        this.alertify.error(error);
      }
    );
  }
}
