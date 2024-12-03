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
      
      // Create a canvas to resize the image
      const img = new Image();
      const maxWidth = 800; // Maximum width for the image
      const maxHeight = 800; // Maximum height for the image
      
      const resizedImage = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get compressed image as base64
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality to reduce size
        };
        
        img.onerror = reject;
        img.src = this.card.image;
      });
  
      // Send the card with resized image
      const cardData = {
        ...this.card,
        image: resizedImage
      };
  
      await this.cardService.createCard(cardData);
      await this.router.navigate(['/user/cards']);
    } catch (err: any) {
      console.error('Error creating card:', err);
      if (err.status === 401) {
        localStorage.setItem('redirectAfterLogin', '/user/cards/create');
        await this.router.navigate(['/login']);
      } else {
        alert('Error creating card. The image might be too large. Please try a smaller image or compress it first.');
      }
    }
  }
}
