import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CardService } from '../../_services/card.service';
import { AuthService } from '../../_services/auth.service';

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

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private router: Router
  ) {}

  createCard(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('User is not authenticated. Please log in.');
      this.router.navigate(['/login']);
      return;
    }

    // Validate all required fields
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // For now, just create a temporary URL for the selected image
      this.card.image = URL.createObjectURL(file);
      
      // Here you would typically upload the file to your server
      // and get back a URL to store in this.card.image
      // this.uploadImage(file);
    }
  }

  // Add this method to handle actual file upload to server
  private uploadImage(file: File): void {
    const formData = new FormData();
    formData.append('image', file);
    
    // You'll need to implement this in your CardService
    // this.cardService.uploadImage(formData).subscribe({
    //   next: (response) => {
    //     this.card.image = response.imageUrl;
    //   },
    //   error: (error) => {
    //     console.error('Error uploading image:', error);
    //     alert('Error uploading image');
    //   }
    // });
  }
}
  