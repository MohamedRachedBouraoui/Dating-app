import { Component, OnInit, Injector } from '@angular/core';
import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { Pagination, PaginatedResult } from 'src/app/_models/pagination';
import { BaseComponent } from 'src/app/base-component';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent extends BaseComponent implements OnInit {

  users: User[];

  loggedInUser: User;

  genderList = [{ value: 'male', display: 'Male' }, { value: 'female', display: 'Female' }];
  userParams: any = {};// Intialized with same default values in API

  pagination: Pagination;

  constructor(injector: Injector, private userService: UserService) {
    super(injector);
  }

  ngOnInit() {
    this.loadUsersFromResolver();
    this.initUserParams();
  }

  initUserParams() {
    this.loggedInUser = this.authService.getLoggedInUser();
    this.userParams.gender = this.loggedInUser.gender.toLowerCase() === 'male' ? 'female' : 'male';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
    this.loadUsersFromService();
  }

  loadUsersFromResolver(): void {
    this.activatedRoute.data.subscribe(
      (data: any) => {
        this.users = data.users.result; // got from member-list-resolver
        this.pagination = data.users.pagination; // got from member-list-resolver
      },
      error => {
        this.alertify.error(error);
      }
    );
  }

  loadUsersFromService(): void {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams).subscribe((paginationResult: PaginatedResult<User[]>) => {
      this.pagination = paginationResult.pagination;
      this.users = paginationResult.result;
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsersFromService();
  }
}
