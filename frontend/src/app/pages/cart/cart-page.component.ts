import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-cart-page',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <section class="empty-state" *ngIf="items.length === 0">
      <app-icon name="cart" [size]="40" className="empty-state__icon"></app-icon>
      <p class="section__eyebrow">CARRITO</p>
      <h2 class="section__title section__title--md">Tu carrito esta vacio ☕</h2>
      <p class="section__copy">Agrega productos desde el menu para continuar con tu pedido.</p>
      <div class="row-actions justify-center">
        <a class="btn-primary" routerLink="/catalog">Ver menu</a>
      </div>
    </section>

      <section class="panel section" *ngIf="items.length > 0">
        <p class="section__eyebrow">CARRITO</p>
        <h1 class="section__title">Revisa tu pedido</h1>
        <p class="section__copy">Ajusta cantidades con controles rapidos y confirma en checkout.</p>

      <div class="cart-list">
        <article class="cart-line fade-up" *ngFor="let item of items; let i = index" [style.--delay]="(i * 45) + 'ms'">
          <div class="cart-line__main">
            <h3>{{ item.name }}</h3>
            <p>Q{{ item.unitPrice | number:'1.2-2' }} por unidad</p>
          </div>

          <div class="cart-line__actions">
            <div class="counter counter--line">
              <button class="counter__btn" type="button" (click)="decrease(item.productId)">-</button>
              <span class="counter__value">{{ item.quantity }}</span>
              <button class="counter__btn" type="button" (click)="increase(item.productId)">+</button>
            </div>
            <strong class="cart-line__subtotal">Q{{ (item.quantity * item.unitPrice) | number:'1.2-2' }}</strong>
            <button class="btn-outline btn-small" type="button" (click)="remove(item.productId)">Eliminar</button>
          </div>
        </article>
      </div>

      <div class="cart-summary-grid">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <strong>Q{{ subtotal | number:'1.2-2' }}</strong>
        </div>
        <div class="cart-summary-row">
          <span>Envio</span>
          <strong>Q{{ shipping | number:'1.2-2' }} (Gratis)</strong>
        </div>
        <div class="cart-summary-row">
          <span>IVA (12%)</span>
          <strong>Q{{ ivaAmount | number:'1.2-2' }}</strong>
        </div>
        <div class="cart-summary-row cart-summary-row--total">
          <span>Total</span>
          <strong>Q{{ total | number:'1.2-2' }}</strong>
        </div>
      </div>
    </section>

    <section class="cart-sticky" *ngIf="items.length > 0">
      <div class="cart-sticky__total">
        <strong>Total Q{{ total | number:'1.2-2' }}</strong>
        <span>{{ cart.totalItems }} {{ cart.totalItems === 1 ? 'item' : 'items' }}</span>
      </div>
      <div class="cart-sticky__actions">
        <a class="btn-outline" routerLink="/catalog">Seguir</a>
        <button class="btn-outline" type="button" (click)="clear()">Vaciar</button>
        <a class="btn-primary" routerLink="/checkout">Checkout</a>
      </div>
    </section>
  `
})
export class CartPageComponent {
  constructor(public readonly cart: CartService, private readonly toast: ToastService) {}

  get items() {
    return this.cart.snapshot;
  }

  get total() {
    return this.cart.grandTotal;
  }

  get subtotal() {
    return this.cart.subtotal;
  }

  get shipping() {
    return this.cart.shipping;
  }

  get ivaAmount() {
    return this.cart.ivaAmount;
  }

  remove(productId: string): void {
    this.cart.remove(productId);
    this.toast.success('Producto eliminado del carrito.');
  }

  increase(productId: string): void {
    this.cart.increase(productId);
  }

  decrease(productId: string): void {
    this.cart.decrease(productId);
  }

  clear(): void {
    this.cart.clear();
    this.toast.success('Carrito vaciado.');
  }
}
