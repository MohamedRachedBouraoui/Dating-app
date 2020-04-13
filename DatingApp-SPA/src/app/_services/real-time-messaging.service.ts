import { Injectable, OnInit } from '@angular/core';
import *  as signalR from '@aspnet/signalr';
import { Message } from '../_models/message';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class RealTimeMessagingService {



  // photoUrlSubjectBehavior = new BehaviorSubject<string>(this.unknownUserPhoto);
  // currentPhotoUrl = this.photoUrlSubjectBehavior.asObservable();
  defaultMsg: Message = {
    id: -1,
    content: '',
    isRead: false,
    readOn: new Date(),
    sentOn: new Date(),
    senderId: -1,
    senderKnownAs: '',
    senderPhotoUrl: '',
    recipientId: -1,
    recipientKnownAs: '',
    recipientPhotoUrl: '',
  };

  newMessageObserver = new BehaviorSubject<Message>(this.defaultMsg);

  hubConnection: signalR.HubConnection;

  constructor() { this.initHubConnection(); }

  initHubConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('http://localhost:5000/messaging').build();


    this.hubConnection.on('new_message', (msg: Message) => {
      this.newMessageObserver.next(msg);
    });

    this.hubConnection.start()
      .then(() => console.log('connected to messaging hub .'))
      .catch(err => console.log(err));
  }

  onNewMessage(): BehaviorSubject<Message> {
    return this.newMessageObserver;
  }

  sendNewMessage(msg: Message) {
    this.hubConnection.invoke('send', msg);
  }
}
