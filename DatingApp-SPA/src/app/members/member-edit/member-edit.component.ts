import { Component, OnInit, Injector, ViewChild, HostListener } from '@angular/core';
import { BaseComponent } from 'src/app/base-component';
import { User } from 'src/app/_models/user';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/_services/user.service';
import { JwtService } from 'src/app/_services/jwt.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent extends BaseComponent implements OnInit {

  user: User;
  @ViewChild('editForm', { static: true }) editForm: NgForm;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private injector: Injector,
    private userService: UserService) {
    super(injector);
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.user = data.user;
    });
  }
  updateUser(): void {
    this.userService.updateUser(+this.jwtService.decodeTokenAndRetrieveInfo(JwtService.NAME_ID), this.user)
      .subscribe(resp => {
        this.alertify.success('Profile Updated');
        this.editForm.reset(this.user);

      }, error => {

        this.alertify.error(error);
      });

  }
}
