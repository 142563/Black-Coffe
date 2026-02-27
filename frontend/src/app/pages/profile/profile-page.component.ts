import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../models/order.models';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule],
  template: `
    <section class="panel section" *ngIf="!auth.isLoggedIn">
      <p class="section__eyebrow">MI CUENTA</p>
      <h2 class="section__title">Inicia sesion para ver tu perfil</h2>
    </section>

    <section class="panel section" *ngIf="auth.isLoggedIn">
      <p class="section__eyebrow">MI CUENTA</p>
      <h1 class="section__title">Perfil</h1>
      <div class="profile-grid">
        <article class="profile-card">
          <h3>Datos de usuario</h3>
          <p><strong>Nombre:</strong> {{ auth.snapshot?.user?.fullName }}</p>
          <p><strong>Email:</strong> {{ auth.snapshot?.user?.email }}</p>
          <p><strong>Telefono:</strong> {{ auth.snapshot?.user?.phone }}</p>
          <p><strong>Roles:</strong> {{ (auth.snapshot?.user?.roles || []).join(', ') }}</p>
        </article>
      </div>
    </section>

    <section class="panel section" *ngIf="auth.isLoggedIn">
      <h2 class="section__title section__title--md">Historial de pedidos</h2>
      <p class="section__copy section__copy--small" *ngIf="loadingOrders">Cargando pedidos...</p>
      <p class="message" *ngIf="ordersMessage">{{ ordersMessage }}</p>

      <div class="list" *ngIf="orders.length > 0">
        <article class="list-item" *ngFor="let order of orders">
          <div class="list-item__main">
            <strong>{{ order.status }}</strong>
            <p>{{ order.createdAtUtc | date:'medium' }}</p>
          </div>
          <strong>Q{{ order.totalAmount | number:'1.2-2' }}</strong>
        </article>
      </div>

      <section class="empty-state" *ngIf="!loadingOrders && orders.length === 0">
        <svg viewBox="0 0 24 24" class="empty-state__icon fill-none stroke-current stroke-[1.6]">
          <path d="M5 6h14M7 6l1 12h8l1-12M10 10v5M14 10v5"></path>
        </svg>
        <h3 class="section__title section__title--md">Aun no tienes pedidos</h3>
        <p class="section__copy">Cuando hagas tu primera compra aparecera aqui.</p>
      </section>
    </section>
  `
})
export class ProfilePageComponent implements OnInit {
  orders: Order[] = [];
  loadingOrders = false;
  ordersMessage = '';

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.auth.token) {
      return;
    }

    this.loadingOrders = true;
    this.ordersMessage = '';

    try {
      this.orders = await this.api.get<Order[]>('/orders/my', this.auth.token);
    } catch (error: unknown) {
      const httpError = error as { status?: number; error?: { message?: string }; message?: string };
      this.ordersMessage = httpError.error?.message ?? httpError.message ?? 'No se pudo cargar el historial.';
      this.toast.error(this.ordersMessage);
    } finally {
      this.loadingOrders = false;
    }
  }
}
