import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateOrderRequest } from '../../models/order.models';

@Component({
  standalone: true,
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="panel section" *ngIf="!auth.isLoggedIn">
      <p class="section__eyebrow">CHECKOUT</p>
      <h2 class="section__title">Necesitas login para continuar</h2>
      <p class="section__copy">Inicia sesión o crea tu cuenta primero.</p>
      <a class="btn" routerLink="/login">IR A LOGIN</a>
    </section>

    <section class="panel section checkout-section" *ngIf="auth.isLoggedIn">
      <p class="section__eyebrow">CHECKOUT</p>
      <h1 class="section__title">Confirmar pedido</h1>
      <p class="section__copy">Pago online se agregará en la siguiente fase. Por ahora solo confirmación de pedido.</p>
      <p class="message message--soft">Total actual: Q{{ cart.total | number:'1.2-2' }}</p>

      <form class="form" (ngSubmit)="submit()">
        <fieldset class="checkout-mode checkout-mode--segmented">
          <legend>Tipo de pedido</legend>
          <label class="checkout-mode-option" [class.checkout-mode-option--active]="serviceType === 'pickup'">
            <input type="radio" name="serviceType" [value]="'pickup'" [(ngModel)]="serviceType" />
            <span>Recoger en restaurante</span>
          </label>
          <label class="checkout-mode-option" [class.checkout-mode-option--active]="serviceType === 'dinein'">
            <input type="radio" name="serviceType" [value]="'dinein'" [(ngModel)]="serviceType" />
            <span>Consumir en local</span>
          </label>
        </fieldset>

        <input [(ngModel)]="customerName" name="customerName" placeholder="Nombre" required />
        <input [(ngModel)]="customerPhone" name="customerPhone" placeholder="Teléfono" required />
        <textarea [(ngModel)]="notes" name="notes" placeholder="Notas (opcional)"></textarea>

        <div class="row-actions row-actions--stretch">
          <a class="btn btn-outline" routerLink="/cart">VOLVER A CARRITO</a>
          <button class="btn" [disabled]="loading || cart.snapshot.length === 0">CONFIRMAR PEDIDO</button>
        </div>
      </form>

      <p *ngIf="message" class="message">{{ message }}</p>
    </section>
  `
})
export class CheckoutPageComponent {
  serviceType: 'pickup' | 'dinein' = 'pickup';
  customerName = '';
  customerPhone = '';
  notes = '';
  message = '';
  loading = false;

  constructor(
    public readonly auth: AuthService,
    public readonly cart: CartService,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  async submit(): Promise<void> {
    if (!this.auth.token || this.cart.snapshot.length === 0) return;

    this.loading = true;
    this.message = '';

    try {
      const payload: CreateOrderRequest = {
        customerName: this.customerName,
        customerPhone: this.customerPhone,
        notes: this.buildNotes(),
        items: this.cart.snapshot.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      };

      await this.api.post('/orders', payload, this.auth.token);
      this.cart.clear();
      this.message = this.serviceType === 'pickup'
        ? 'Pedido creado con exito. Puedes recogerlo en restaurante.'
        : 'Pedido creado con exito para consumo en local.';
      this.toast.success(this.message);
      setTimeout(() => this.router.navigate(['/profile']), 900);
    } catch (error: any) {
      if (error?.status === 0) {
        this.message = 'No hay conexion con backend. Levanta la API en http://localhost:5088.';
        this.toast.error(this.message);
        return;
      }

      if (error?.status === 401) {
        this.message = 'Sesion expirada. Inicia sesion nuevamente.';
        this.toast.error(this.message);
        return;
      }

      this.message = error?.error?.message ?? error?.message ?? 'No se pudo crear el pedido';
      this.toast.error(this.message);
    } finally {
      this.loading = false;
    }
  }

  private buildNotes(): string {
    const modeNote = this.serviceType === 'pickup'
      ? 'Tipo de entrega: Recoger en restaurante.'
      : 'Tipo de entrega: Consumir en local.';

    const notes = this.notes.trim();
    return notes ? `${modeNote} ${notes}` : modeNote;
  }
}
