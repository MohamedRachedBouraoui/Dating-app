import { Component, OnInit, Injector } from '@angular/core';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { BaseComponent } from '../base-component';
import { UserService } from '../_services/user.service';
import { Message } from '../_models/message';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent extends BaseComponent implements OnInit {

  messages: Message[];
  pagination: Pagination;

  messageContainer = 'Unread';

  constructor(private injector: Injector, private userService: UserService) {
    super(injector);
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.messages = data.messages.result;
      this.pagination = data.messages.pagination;
    });
  }

  loadMessages() {

    this.userService.getMessages(this.authService.getLoggedInUser().id,
      this.pagination.currentPage,
      this.pagination.itemsPerPage,
      this.messageContainer)
      .subscribe((msgs: PaginatedResult<Message[]>) => {
        this.messages = msgs.result;
        this.pagination = msgs.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }

  deleteMessage(message: Message): void {
    this.alertify.confirm('Are you sure u want to delete the message', () => {

      const userId = this.authService.getLoggedInUser().id;

      this.userService.deleteMessage(userId, message.id).subscribe(() => {

        this.messages = this.messages.filter(m => m.id !== message.id);
        this.alertify.success('Message deleted');

      }, error => {
        this.alertify.error(error);
      });
    });
  }

  markMessageAsRead(message: Message): void {
    const userId = this.authService.getLoggedInUser().id;

    this.userService.markMessageAsRead(userId, [message.id]).subscribe(() => {
      this.alertify.success('Message is marked as Read');

      this.loadMessages();

    }, error => {
      this.alertify.error(error);
    });
  }


  pageChanged(event): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

}
