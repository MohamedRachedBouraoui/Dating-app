import { Component, OnInit, Injector } from '@angular/core';
import { BaseComponent } from 'src/app/base-component';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent extends BaseComponent implements OnInit {

  users: User[];
  bsModalRef: BsModalRef;

  constructor(private injector: Injector
    , private adminService: AdminService
    , private modalService: BsModalService) {
    super(injector);
  }

  ngOnInit() {
    this.getUserWithRoles();
  }

  getUserWithRoles(): void {
    this.adminService.getUsersWithRoles().subscribe((usrs: User[]) => {
      this.users = usrs;
    }, error => {
      console.log(error);
      // this.alertify.error(error);
    });
  }

  editRolesModal(user: User) {

    const initialState = {
      user,
      roles: this.getRolesArray(user),
      title: 'Edit Roles for: ' + user.userName,
      closeBtnName: 'Save'
    };

    this.bsModalRef = this.modalService.show(RolesModalComponent, { initialState });
    this.bsModalRef.content.updateRoles.subscribe((rolesToUpdate: string[]) => {

      if (rolesToUpdate) {
        this.updateRoles(user, rolesToUpdate);
      }
    });
  }

  updateRoles(user: User, rolesToUpdate: string[]) {

    this.adminService.updateUserRoles(user.userName, rolesToUpdate).subscribe(newRoles => {
      user.roles = newRoles;
    }, error => {
      console.log(error);
    });
  }

  getRolesArray(user: User) {
    const roles = [];
    const userRoles = user.roles.map(r => r.toLowerCase());

    const availableRoles = [
      { name: 'Admin', value: 'Admin', checked: false },
      { name: 'Moderator', value: 'Moderator', checked: false },
      { name: 'Member', value: 'Member', checked: false },
      { name: 'VIP', value: 'VIP', checked: false }
    ];

    availableRoles.forEach(available => {
      available.checked = userRoles.includes(available.name.toLowerCase());
    });
    return availableRoles;
  }

}
