import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StorefrontService } from '../../core/services/storefront.service';
import { FeaturedMenuItem, StorefrontBanner, StorefrontSettings } from '../../models/storefront.models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="space-y-10">
      <section class="panel py-3" *ngIf="settings.businessMessage">
        <div class="business-message">
          <app-icon name="spark" [size]="18"></app-icon>
          <p>{{ settings.businessMessage }}</p>
        </div>
      </section>

      <section class="hero-card">
        <div class="hero-card__ornament"></div>
        <div class="hero-card__content">
          <span class="badge">{{ settings.name }}</span>
          <p class="section__eyebrow">Boutique coffee commerce</p>
          <h1 class="section__title section__title--hero">CAFETERIA DIGITAL</h1>
          <p class="section__copy section__copy--wide">{{ settings.tagline }}</p>

          <div class="row-actions">
            <a class="btn-primary" routerLink="/catalog">Ver menu</a>
            <a class="btn-outline" routerLink="/reservations">Reservar</a>
            <a *ngIf="!auth.isLoggedIn" class="btn-outline" routerLink="/login">Iniciar sesion</a>
          </div>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2" *ngIf="banners.length > 0">
        <article class="card banner-card" *ngFor="let banner of banners">
          <p class="section__eyebrow">{{ banner.type }}</p>
          <h2>{{ banner.title }}</h2>
          <p>{{ banner.subtitle }}</p>
          <a class="btn-outline btn-small" [routerLink]="resolveBannerLink(banner.ctaLink)">{{ banner.ctaText }}</a>
        </article>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="spark" [size]="22"></app-icon>
          </div>
          <h2>Pedidos rapidos</h2>
          <p>Flujo comercial listo para vender con calculo de IVA y factura.</p>
        </article>

        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="calendar" [size]="22"></app-icon>
          </div>
          <h2>Reserva tu mesa</h2>
          <p>Agenda visitas desde web con experiencia clara y premium.</p>
        </article>

        <article class="card feature-card">
          <div class="feature-card__icon">
            <app-icon name="user" [size]="22"></app-icon>
          </div>
          <h2>Tu cuenta</h2>
          <p>Historial de pedidos, perfil y seguimiento de ordenes.</p>
        </article>
      </section>

      <section class="panel section" id="featured">
        <p class="section__eyebrow">DESTACADOS</p>
        <h2 class="section__title section__title--md">Recomendados del dia</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <article class="featured-card" *ngFor="let item of featured">
            <div class="featured-card__image">
              <img [src]="resolveFeaturedImage(item.imageUrl)" [alt]="item.name" loading="lazy" />
            </div>
            <div class="space-y-2">
              <span class="badge">{{ item.badgeText }}</span>
              <h3>{{ item.name }}</h3>
              <p>Desde Q{{ item.priceFrom | number:'1.2-2' }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="panel section">
        <p class="section__eyebrow">COMO FUNCIONA</p>
        <h2 class="section__title section__title--md">Tu experiencia en 3 pasos</h2>
        <div class="grid gap-3 md:grid-cols-3">
          <article class="step-card">
            <span class="step-card__index">01</span>
            <h3>Elige</h3>
            <p>Explora menu, categorias y tamanos en un flujo simple.</p>
          </article>

          <article class="step-card">
            <span class="step-card__index">02</span>
            <h3>Confirma</h3>
            <p>Revisa subtotal, IVA 12% y total antes de pagar.</p>
          </article>

          <article class="step-card">
            <span class="step-card__index">03</span>
            <h3>Recoge</h3>
            <p>Tu pedido queda listo para recoger o consumir en local.</p>
          </article>
        </div>
      </section>

      <section class="panel section">
        <p class="section__eyebrow">CONTACTO</p>
        <h2 class="section__title section__title--md">Horarios y ubicacion</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <article class="info-card">
            <div class="info-card__row">
              <app-icon name="clock" [size]="20" className="text-brand-caramel"></app-icon>
              <div>
                <h3>Horario</h3>
                <p>{{ settings.hoursText }}</p>
              </div>
            </div>
          </article>

          <article class="info-card">
            <div class="info-card__row">
              <app-icon name="map-pin" [size]="20" className="text-brand-caramel"></app-icon>
              <div>
                <h3>Direccion</h3>
                <p>{{ settings.address }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  `
})
export class HomePageComponent implements OnInit {
  readonly fallbackImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80';

  settings: StorefrontSettings = {
    name: 'Black Coffe',
    tagline: 'Cafe premium, rapido y a tu manera',
    logoUrl: '/assets/logo-black-coffe.jpeg',
    accentColor: '#C6A15B',
    phone: '+502 0000-0000',
    whatsapp: '+502 0000-0000',
    address: 'Escuintla, Guatemala',
    hoursText: 'Lun-Vie 7:00-19:00 | Sab-Dom 8:00-18:00',
    businessMessage: 'Pedidos listos en 10-15 min | Calidad premium | Reservas disponibles',
    socialLinks: {
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/'
    }
  };

  banners: StorefrontBanner[] = [];
  featured: FeaturedMenuItem[] = [];

  constructor(
    public readonly auth: AuthService,
    private readonly storefrontService: StorefrontService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [settings, banners, featured] = await Promise.all([
        this.storefrontService.getSettings(),
        this.storefrontService.getBanners(),
        this.storefrontService.getFeatured()
      ]);
      this.settings = settings;
      this.banners = banners;
      this.featured = featured;
    } catch {
      this.featured = [];
      this.banners = [];
    }
  }

  resolveBannerLink(rawLink: string): string {
    if (!rawLink) {
      return '/catalog';
    }

    if (rawLink.startsWith('/menu')) {
      return '/catalog';
    }

    return rawLink;
  }

  resolveFeaturedImage(rawImage: string): string {
    if (!rawImage || rawImage.startsWith('/assets/products/')) {
      return this.fallbackImage;
    }

    return rawImage;
  }
}
