import { Component, OnInit, Injector } from '@angular/core';
import { BaseComponent } from '../base-component';
import { User } from '../_models/user';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent extends BaseComponent implements OnInit {

  users: User[];
  pagination: Pagination;
  likesParam: string;

  constructor(private injector: Injector, private userService: UserService) {
    super(injector);
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.users = data.users.result;
      this.pagination = data.users.pagination;
    });

    this.likesParam = 'Likers';
  }

  loadUsersFromService(): void {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, null, this.likesParam)
      .subscribe((paginationResult: PaginatedResult<User[]>) => {
        this.pagination = paginationResult.pagination;
        this.users = paginationResult.result;
      });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsersFromService();
  }

}
