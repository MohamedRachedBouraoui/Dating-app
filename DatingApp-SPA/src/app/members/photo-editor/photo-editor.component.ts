import { Component, OnInit, Input, Injector, EventEmitter, Output } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Photo } from 'src/app/_models/photo';
import { environment } from 'src/environments/environment';
import { BaseComponent } from 'src/app/base-component';
import { JwtService } from 'src/app/_services/jwt.service';
import { UserService } from 'src/app/_services/user.service';


@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent extends BaseComponent implements OnInit {

  /////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// SEE https://valor-software.com/ng2-file-upload/  /////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////

  @Input() photos: Photo[];
  apiUrl = environment.apiUrl;

  @Output() mainPhotoUpdated: EventEmitter<string> = new EventEmitter<string>();

  get loggedUserId(): number {
    return this.jwtService.decodeTokenAndRetrieveInfo(JwtService.NAME_ID);
  }

  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  // hasAnotherDropZoneOver: boolean;
  response: string;

  constructor(private injector: Injector,
    private userService: UserService) {
    super(injector);

  }

  ngOnInit() {

    this.initFileUploader();
  }

  setMainPhoto(newMainPhoto: Photo): void {

    this.userService.setUserMainPhoto(this.loggedUserId, newMainPhoto.id).subscribe(
      data => {

        this.photos.find(p => p.isMain === true).isMain = false; // update the isMain  status for the old main photo
        newMainPhoto.isMain = true;
        this.authService.changeMemberPhoto(newMainPhoto.url);

      }, error => {
        this.alertify.error(error);
      }
    );
  }

  deletePhoto(photoToDelete: Photo): void {

    this.alertify.confirm('Are You sure you want to Delete this Photo ?', () => {
      this.userService.deletePhoto(this.loggedUserId, photoToDelete.id).subscribe(
        data => {

          this.photos = this.photos.filter(p => p.id !== photoToDelete.id);
          this.alertify.success('Photo has been Deleted');

        }, error => {
          this.alertify.error(error);
        }
      );
    });

  }


  private initFileUploader() {
    this.uploader = new FileUploader({
      url: this.apiUrl + 'users/' + this.loggedUserId + '/photos',
      authToken: 'Bearer ' + this.jwtService.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024 //10mb
      //   disableMultipart: true,
      //   formatDataFunctionIsAsync: true,
      //   formatDataFunction: async (item) => {
      //     return new Promise((resolve, reject) => {
      //       resolve({
      //         name: item._file.name,
      //         length: item._file.size,
      //         contentType: item._file.type,
      //         date: new Date()
      //       });
      //     });
      //   }
    });

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };
    this.uploader.onSuccessItem = (item, response, stauts, header) => {

      if (response) {

        const res: Photo = JSON.parse(response);

        const photo: Photo = {
          id: res.id,
          url: res.url,
          description: res.description,
          dateAdded: res.dateAdded,
          isMain: res.isMain,
          isApproved: res.isApproved,
        };
        this.photos.push(photo);
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
        }
      }
    };
    // this.hasBaseDropZoneOver = false;
    // this.hasAnotherDropZoneOver = false;
    // this.response = '';
    // this.uploader.response.subscribe(res => this.response = res);
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // public fileOverAnother(e: any): void {
  //   this.hasAnotherDropZoneOver = e;
  // }


}
