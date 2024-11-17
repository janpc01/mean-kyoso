import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';

// Import card-related components
import { CardListComponent } from './cards/card-list/card-list.component';
import { CardCreateComponent } from './cards/card-create/card-create.component';
import { CardEditComponent } from './cards/card-edit/card-edit.component';

import { GameRulesComponent } from './cards/game-rules/game-rules.component';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user', component: BoardUserComponent },
  { path: 'mod', component: BoardModeratorComponent },
  { path: 'admin', component: BoardAdminComponent },
  
  // Card functionality routes under `/user`
  { path: 'user/cards', component: CardListComponent },
  { path: 'user/cards/create', component: CardCreateComponent },
  { path: 'user/cards/edit/:id', component: CardEditComponent },

  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'game-rules', component: GameRulesComponent },
  { path: 'cart', component: CartComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
