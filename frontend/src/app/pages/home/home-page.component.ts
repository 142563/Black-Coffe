import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="space-y-12">
      <section class="hero-card">
        <div class="hero-card__ornament"></div>
        <div class="hero-card__content">
          <span class="badge">Black Coffe</span>
          <p class="section__eyebrow">Boutique coffee commerce</p>
          <h1 class="section__title section__title--hero">CAFETERIA DIGITAL PREMIUM</h1>
          <p class="section__copy section__copy--wide">
            Mas que una bebida... es un estilo de vida. Pide, reserva y vive la experiencia Black Coffe desde una sola plataforma.
          </p>

          <div class="row-actions">
            <a class="btn-primary" routerLink="/catalog">Ver menu</a>
            <a class="btn-outline" routerLink="/reservations">Reservar</a>
            <a *ngIf="!auth.isLoggedIn" class="btn-outline" routerLink="/login">Iniciar sesion</a>
          </div>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="spark" [size]="22"></app-icon>
          </div>
          <h2>Pedidos rapidos</h2>
          <p>Selecciona productos por categoria y confirma en segundos.</p>
        </article>

        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="calendar" [size]="22"></app-icon>
          </div>
          <h2>Reserva tu mesa</h2>
          <p>Gestiona visitas al local con una experiencia clara y elegante.</p>
        </article>

        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="user" [size]="22"></app-icon>
          </div>
          <h2>Tu cuenta</h2>
          <p>Historial de pedidos, perfil y estado de sesiones centralizados.</p>
        </article>
      </section>

      <section class="panel section">
        <p class="section__eyebrow">COMO FUNCIONA</p>
        <h2 class="section__title section__title--md">Tu experiencia en 3 pasos</h2>
        <div class="grid gap-3 md:grid-cols-3">
          <article class="step-card">
            <span class="step-card__index">01</span>
            <h3>Elige</h3>
            <p>Explora el menu por categorias y personaliza tu pedido.</p>
          </article>

          <article class="step-card">
            <span class="step-card__index">02</span>
            <h3>Paga / Confirma</h3>
            <p>Revisa tu carrito en el drawer y confirma facilmente.</p>
          </article>

          <article class="step-card">
            <span class="step-card__index">03</span>
            <h3>Recoge / Visita</h3>
            <p>Recoge en tienda o llega a tu reserva con todo listo.</p>
          </article>
        </div>
      </section>

      <section class="panel section">
        <p class="section__eyebrow">UBICACION</p>
        <h2 class="section__title section__title--md">Horarios y ubicacion</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <article class="info-card">
            <div class="info-card__row">
              <app-icon name="clock" [size]="20" className="text-brand-caramel"></app-icon>
              <div>
                <h3>Horario</h3>
                <p>Lunes a Domingo · 7:00 AM a 9:00 PM</p>
              </div>
            </div>
          </article>

          <article class="info-card">
            <div class="info-card__row">
              <app-icon name="map-pin" [size]="20" className="text-brand-caramel"></app-icon>
              <div>
                <h3>Direccion</h3>
                <p>Black Coffe · Sede principal, zona centrica.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  `
})
export class HomePageComponent {
  constructor(public readonly auth: AuthService) {}
}
