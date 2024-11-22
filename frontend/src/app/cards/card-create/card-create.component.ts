import { Component } from '@angular/core';
import { CardService } from '../../_services/card.service';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

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

  imageFile: any = null;

  constructor(
    private cardService: CardService,
    private router: Router,
    private authService: AuthService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.card.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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
      console.error('Error creating card:', err);
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
