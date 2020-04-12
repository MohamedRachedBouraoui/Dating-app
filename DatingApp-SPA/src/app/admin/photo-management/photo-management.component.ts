import { Component, OnInit, Injector } from '@angular/core';
import { BaseComponent } from 'src/app/base-component';
import { AdminService } from 'src/app/_services/admin.service';
import { Photo } from 'src/app/_models/photo';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent extends BaseComponent implements OnInit {
  photos: any[];

  constructor(private injector: Injector, private adminService: AdminService) {
    super(injector);
  }

  ngOnInit() {
    this.getPhotosForApproval();
  }

  getPhotosForApproval() {
    this.adminService.getPhotosForApproval().subscribe((photos: any[]) => {
      this.photos = photos;
    }, error => {
      console.log(error);
    });
  }

  approvePhoto(photoId) {
    this.adminService.approvePhoto(photoId).subscribe(() => {
      this.photos = this.photos.filter(p => p.id !== photoId);
    }, error => {
      console.log(error);
    });
  }


  rejectPhoto(photoId) {
    this.adminService.rejectPhoto(photoId).subscribe(() => {
      this.photos = this.photos.filter(p => p.id !== photoId);
    }, error => {
      console.log(error);
    });
  }

}
