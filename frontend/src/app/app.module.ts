import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardUserComponent } from './board-user/board-user.component';

import { httpInterceptorProviders } from '../_helpers/http.interceptor';
import { CardListComponent } from './cards/card-list/card-list.component';
import { CardCreateComponent } from './cards/card-create/card-create.component';
import { CardEditComponent } from './cards/card-edit/card-edit.component';
import { GameRulesComponent } from './cards/game-rules/game-rules.component';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CartService } from './_services/cart.service';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderService } from './_services/order.service';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { SignupModalComponent } from './signup-modal/signup-modal/signup-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    BoardAdminComponent,
    BoardModeratorComponent,
    BoardUserComponent,
    CardListComponent,
    CardCreateComponent,
    CardEditComponent,
    GameRulesComponent,
    CartComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    SignupModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    ImageCropperComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    httpInterceptorProviders,
    CartService,
    OrderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
