import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { BaseComponent } from 'src/app/base-component';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { TabsetComponent } from 'ngx-bootstrap/tabs/public_api';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent extends BaseComponent implements OnInit {

  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;

  user: User;
  get userPhotUrl(): string {

    if (this.user.photoUrl === '') {
      return '../../assets/unknown-user.png';
    } else {
      return this.user.photoUrl;
    }
  }

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(injector: Injector,
    private activatedRout: ActivatedRoute) {
    super(injector);
  }

  ngOnInit() {
    this.loadUser();
    this.subscribeToMessageTabSelect();
    this.setupGallery();
  }

  subscribeToMessageTabSelect() {
    this.activatedRout.queryParams.subscribe(params => {

      const selectedTab = params.tab;
      if (selectedTab === 'messages') {
        this.selectMsgTab();
      }
    });
  }

  setupGallery() {
    this.galleryOptions = [
      {
        //height: 37.3em;
        width: '100%',
        height: '37.3em',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();
  }

  getImages() {
    const imgUrls = [];
    for (const photo of this.user.photos) {
      imgUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description
      });
    }
    return imgUrls;
  }

  loadUser() {

    this.activatedRout.data.subscribe((data: any) => {
      this.user = data.user as User;
    }, error => {
      this.alertify.error(error);
    });
  }

  selectMsgTab(): void {
    this.memberTabs.tabs[3].active = true;
  }
}
