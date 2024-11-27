import { Component } from '@angular/core';
import { CardService } from '../../_services/card.service';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.css']
})
export class CardCreateComponent {
  card: any = {
    name: '',
    beltRank: '',
    achievement: '',
    clubName: '',
    image: ''
  };

  imageChangedEvent: any = null;
  croppedImage: SafeUrl | null = null;
  showCropModal: boolean = false;

  constructor(
    private cardService: CardService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showCropModal = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
      this.card.image = event.objectUrl;
    }
  }

  imageLoaded(image: LoadedImage) {
    // Image loaded into cropper
  }

  cropperReady() {
    // Cropper is ready to use
  }

  loadImageFailed() {
    alert('Failed to load image. Please try another image.');
    this.showCropModal = false;
    this.imageChangedEvent = null;
  }

  saveCrop() {
    this.showCropModal = false;
    this.imageChangedEvent = null;
  }

  cancelCrop() {
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.card.image = '';
  }

  async createCard(): Promise<void> {
    if (!this.card.name || !this.card.beltRank || !this.card.achievement || !this.card.clubName) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.card.image) {
      alert('Please select an image');
      return;
    }

    try {
      await this.authService.verify();
      await this.cardService.createCard(this.card);
      await this.router.navigate(['/user/cards']);
    } catch (err: any) {
      if (err.status === 401) {
        localStorage.setItem('redirectAfterLogin', '/user/cards/create');
        await this.router.navigate(['/login']);
      } else {
        alert('Please register or login to create a card');
        localStorage.setItem('redirectAfterLogin', '/user/cards/create');
        await this.router.navigate(['/login']);
      }
    }
  }
}
