import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { CatalogPageComponent } from './pages/catalog/catalog-page.component';
import { CartPageComponent } from './pages/cart/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout/checkout-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';
import { ReservationsPageComponent } from './pages/reservations/reservations-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'catalog', component: CatalogPageComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'reservations', component: ReservationsPageComponent },
  { path: '**', redirectTo: '' }
];
