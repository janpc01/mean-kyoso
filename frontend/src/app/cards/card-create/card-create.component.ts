import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardService } from '../../_services/card.service';
import { AuthService } from '../../_services/auth.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

interface Card {
  name: string;
  beltRank: string;
  achievement: string;
  clubName: string;
  image: string;
}

type CardKey = keyof Card;

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.css'],
})
export class CardCreateComponent {
  card: Card = {
    name: '',
    beltRank: '',
    achievement: '',
    clubName: '',
    image: '',
  };

  showCropperModal = false;
  imageFile: File | undefined = undefined;
  croppedImage: string | undefined = undefined;

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private router: Router
  ) {}

  private closeCropperModal(clearImage: boolean = true): void {
    this.showCropperModal = false;  // Hide the modal
  
    if (clearImage) {
      this.imageFile = undefined;    // Reset imageFile only when explicitly clearing
      this.croppedImage = undefined; // Reset croppedImage only when explicitly clearing
    }
  }

  createCard(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('User is not authenticated. Please log in.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Creating card with data:', this.card);

    const requiredFields = {
      name: 'Name',
      beltRank: 'Belt Rank',
      achievement: 'Achievement',
      clubName: 'Club Name',
      image: 'Image URL'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!this.card[field as CardKey]?.trim()) {
        alert(`${label} is required`);
        return;
      }
    }

    this.cardService.createCard(this.card, token).subscribe({
      next: () => {
        alert('Card created successfully!');
        this.router.navigate(['/user/cards']);
      },
      error: (err) => {
        console.error('Error creating card:', err);
        alert('Error creating card: ' + (err.error?.message || err.message));
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file);

    if (!file.type.match(/image\/(jpeg|png|gif)/)) {
      alert('Only image files (JPEG, PNG, GIF) are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    this.imageFile = file;
    this.showCropperModal = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    console.log('ImageCroppedEvent:', event);
    if (event.blob) {
      const reader = new FileReader();
      reader.readAsDataURL(event.blob);
      reader.onloadend = () => {
        this.croppedImage = reader.result as string;
        console.log('Image cropped:', this.croppedImage);
      };
    } else {
      console.error('No blob data available for cropping.');
    }
  }

  saveCroppedImage(): void {
    if (this.croppedImage) {
      this.card.image = this.croppedImage; // Save the cropped image to the card
      console.log('Cropped Image Saved:', this.card.image);
      this.closeCropperModal(false);      // Do not reset croppedImage
    }
  }

  cancelCropping(): void {
    this.closeCropperModal();
  }

  
}
