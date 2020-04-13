import { Component, OnInit, Injector, Input } from '@angular/core';
import { BaseComponent } from 'src/app/base-component';

import { Message } from 'src/app/_models/message';
import { UserService } from 'src/app/_services/user.service';
import { tap } from 'rxjs/operators';
import { RealTimeMessagingService } from 'src/app/_services/real-time-messaging.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent extends BaseComponent implements OnInit {

  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};


  constructor(private injector: Injector, private userService: UserService, private realTimeMsgService: RealTimeMessagingService) {
    super(injector);
  }

  ngOnInit() {
    this.registerForNewMsg();
    // this.registerForMsgIsRead();
    // this.registerForAllMsgsAreRead();

    this.loadMessages();
  }

  registerForAllMsgsAreRead() {
    throw new Error("Method not implemented.");
  }

  registerForMsgIsRead() {
    throw new Error("Method not implemented.");
  }

  registerForNewMsg() {

    this.realTimeMsgService.onNewMessage().subscribe((msg: Message) => {
      if (msg === null || msg === undefined || this.messages === null || this.messages === undefined) {
        return;
      }
      msg.isRead = true;
      msg.readOn = new Date();
      this.messages.unshift(msg);
    });
  }

  loadMessages() {
    const loggedUserId = this.authService.getLoggedInUser().id;
    this.userService.getMessageThread(loggedUserId, this.recipientId)
      .pipe(
        tap((msgs) => {
          const msgsIds = msgs.filter(m => {
            return m.recipientId === loggedUserId && m.isRead === false;
          }).map(m => m.id);
          if (msgsIds.length > 0) {
            this.userService.markMessageAsRead(loggedUserId, msgsIds).subscribe();
          }

        })
      )
      .subscribe((messages: Message[]) => {

        this.messages = messages;
      }, error => {
        this.alertify.error(error);
      }
      );
  }

  sendMessage(): void {
    const senderId = this.authService.getLoggedInUser().id;
    this.newMessage.recipientId = this.recipientId;

    this.userService.sendMessage(senderId, this.newMessage).subscribe((msg: Message) => {
      this.messages.unshift(msg);
      this.newMessage.content = '';
      this.realTimeMsgService.sendNewMessage(msg);
    }, error => {
      this.alertify.error(error);
    }
    );
  }

}
