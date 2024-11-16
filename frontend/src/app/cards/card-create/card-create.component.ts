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

    // Check file type
    if (!file.type.match(/image\/(jpeg|png|gif)/)) {
      alert('Only image files (JPEG, PNG, GIF) are allowed');
      return;
    }

    // Check file size (e.g., max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max width/height of 800px)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get compressed image as Base64 string
          this.card.image = canvas.toDataURL('image/jpeg', 0.7); // 0.7 is the quality (0-1)
        };
      };
      reader.readAsDataURL(file);
    }
  }
}
  