import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent implements OnInit {

  @Output() updateRoles = new EventEmitter();
  title: string;
  closeBtnName: string;
  user: User;
  roles: any[] = [];

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  updateSelectedRoles(): void {
    const newRoles = this.roles.filter(r => r.checked).map(rl => rl.name);
    this.updateRoles.emit(newRoles);
    this.bsModalRef.hide();
  }

}
