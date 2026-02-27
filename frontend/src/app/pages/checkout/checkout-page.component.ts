import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CommerceOrderService } from '../../core/services/commerce-order.service';
import { ToastService } from '../../core/services/toast.service';
import {
  CreateOrderResponse,
  Invoice,
  OrderPreviewRequest,
  OrderPreviewResponse,
  PlaceOrderRequest
} from '../../models/order.models';

@Component({
  standalone: true,
  selector: 'app-checkout-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="panel section" *ngIf="!auth.isLoggedIn">
      <p class="section__eyebrow">CHECKOUT</p>
      <h2 class="section__title">Necesitas login para continuar</h2>
      <p class="section__copy">Inicia sesion o crea tu cuenta para confirmar pedidos.</p>
      <a class="btn-primary" routerLink="/login">Ir a login</a>
    </section>

    <section class="panel section" *ngIf="auth.isLoggedIn && cart.snapshot.length === 0 && !orderResult">
      <p class="section__eyebrow">CHECKOUT</p>
      <h2 class="section__title">Tu carrito esta vacio</h2>
      <p class="section__copy">Agrega productos para continuar.</p>
      <a class="btn-primary" routerLink="/catalog">Ver menu</a>
    </section>

    <section class="panel section checkout-section" *ngIf="auth.isLoggedIn && (cart.snapshot.length > 0 || orderResult)">
      <p class="section__eyebrow">CHECKOUT</p>
      <h1 class="section__title">Confirmar pedido</h1>
      <p class="section__copy">Resumen comercial con IVA 12% y envio gratis.</p>

      <form class="form" (ngSubmit)="submit()" *ngIf="!orderResult">
        <fieldset class="checkout-mode checkout-mode--segmented">
          <legend>Tipo de pedido</legend>
          <label class="checkout-mode-option" [class.checkout-mode-option--active]="serviceType === 'pickup'">
            <input type="radio" name="serviceType" [value]="'pickup'" [(ngModel)]="serviceType" (change)="refreshPreview()" />
            <span>Recoger en restaurante</span>
          </label>
          <label class="checkout-mode-option" [class.checkout-mode-option--active]="serviceType === 'dinein'">
            <input type="radio" name="serviceType" [value]="'dinein'" [(ngModel)]="serviceType" (change)="refreshPreview()" />
            <span>Consumir en local</span>
          </label>
        </fieldset>

        <div class="grid gap-3 md:grid-cols-2">
          <input [(ngModel)]="customerName" name="customerName" placeholder="Nombre" required />
          <input [(ngModel)]="customerPhone" name="customerPhone" placeholder="Telefono" required />
        </div>
        <input [(ngModel)]="customerNit" name="customerNit" placeholder="NIT (opcional)" />
        <textarea [(ngModel)]="notes" name="notes" placeholder="Notas (opcional)"></textarea>

        <div class="checkout-summary-card" *ngIf="preview">
          <h3>Resumen</h3>
          <div class="checkout-summary-row">
            <span>Subtotal</span>
            <strong>Q{{ preview.summary.subtotal | number:'1.2-2' }}</strong>
          </div>
          <div class="checkout-summary-row">
            <span>Envio</span>
            <strong>Q{{ preview.summary.shipping | number:'1.2-2' }} (Gratis)</strong>
          </div>
          <div class="checkout-summary-row">
            <span>IVA ({{ (preview.summary.ivaRate * 100) | number:'1.0-0' }}%)</span>
            <strong>Q{{ preview.summary.ivaAmount | number:'1.2-2' }}</strong>
          </div>
          <div class="checkout-summary-row checkout-summary-row--total">
            <span>Total</span>
            <strong>Q{{ preview.summary.total | number:'1.2-2' }}</strong>
          </div>
        </div>

        <p class="message" *ngIf="message">{{ message }}</p>

        <div class="row-actions row-actions--stretch">
          <a class="btn-outline" routerLink="/cart">Volver a carrito</a>
          <button class="btn-primary" type="button" [disabled]="loading" (click)="refreshPreview()">Actualizar resumen</button>
          <button class="btn-primary" [disabled]="loading || !preview">Confirmar pedido</button>
        </div>
      </form>

      <section class="order-confirmation" *ngIf="orderResult">
        <h2>Pedido confirmado</h2>
        <p>Orden #{{ orderResult.orderId }} creada con estado {{ orderResult.status }}.</p>
        <div class="checkout-summary-card">
          <div class="checkout-summary-row">
            <span>Total confirmado</span>
            <strong>Q{{ orderResult.summary.total | number:'1.2-2' }}</strong>
          </div>
        </div>
        <div class="row-actions">
          <button class="btn-primary" type="button" (click)="loadInvoice()" [disabled]="loadingInvoice">Ver factura</button>
          <a class="btn-outline" routerLink="/profile">Ir a mi cuenta</a>
        </div>
      </section>
    </section>

    <section class="panel section" *ngIf="invoice">
      <div class="invoice-printable" id="invoice-printable">
        <p class="section__eyebrow">FACTURA</p>
        <h2 class="section__title section__title--md">{{ invoice.business.name }}</h2>
        <p class="section__copy">{{ invoice.business.address }} | {{ invoice.business.phone }} | {{ invoice.business.hoursText }}</p>
        <p class="section__copy section__copy--small">{{ invoice.businessMessage }}</p>
        <div class="invoice-meta">
          <span><strong>Factura:</strong> {{ invoice.invoiceNumber }}</span>
          <span><strong>Fecha:</strong> {{ invoice.date | date:'medium' }}</span>
          <span *ngIf="invoice.customerName"><strong>Cliente:</strong> {{ invoice.customerName }}</span>
          <span *ngIf="invoice.customerNit"><strong>NIT:</strong> {{ invoice.customerNit }}</span>
        </div>

        <div class="invoice-table">
          <div class="invoice-row invoice-row--head">
            <span>Item</span>
            <span>Cant.</span>
            <span>Unitario</span>
            <span>Total</span>
          </div>
          <div class="invoice-row" *ngFor="let item of invoice.items">
            <span>{{ item.name }}</span>
            <span>{{ item.qty }}</span>
            <span>Q{{ item.unitPrice | number:'1.2-2' }}</span>
            <span>Q{{ item.lineTotal | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="checkout-summary-card">
          <div class="checkout-summary-row">
            <span>Subtotal</span>
            <strong>Q{{ invoice.subtotal | number:'1.2-2' }}</strong>
          </div>
          <div class="checkout-summary-row">
            <span>Envio</span>
            <strong>Q{{ invoice.shipping | number:'1.2-2' }}</strong>
          </div>
          <div class="checkout-summary-row">
            <span>IVA ({{ (invoice.ivaRate * 100) | number:'1.0-0' }}%)</span>
            <strong>Q{{ invoice.ivaAmount | number:'1.2-2' }}</strong>
          </div>
          <div class="checkout-summary-row checkout-summary-row--total">
            <span>Total</span>
            <strong>Q{{ invoice.total | number:'1.2-2' }}</strong>
          </div>
        </div>
      </div>

      <div class="row-actions">
        <button class="btn-primary" type="button" (click)="printInvoice()">Imprimir</button>
      </div>
    </section>
  `
})
export class CheckoutPageComponent implements OnInit {
  serviceType: 'pickup' | 'dinein' = 'pickup';
  customerName = '';
  customerPhone = '';
  customerNit = '';
  notes = '';
  message = '';
  loading = false;
  loadingInvoice = false;

  preview: OrderPreviewResponse | null = null;
  orderResult: CreateOrderResponse | null = null;
  invoice: Invoice | null = null;

  constructor(
    public readonly auth: AuthService,
    public readonly cart: CartService,
    private readonly commerceOrderService: CommerceOrderService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.auth.isLoggedIn && this.cart.snapshot.length > 0) {
      await this.refreshPreview();
    }
  }

  async refreshPreview(): Promise<void> {
    if (this.cart.snapshot.length === 0) {
      this.preview = null;
      return;
    }

    try {
      const request: OrderPreviewRequest = {
        items: this.cart.snapshot.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      this.preview = await this.commerceOrderService.preview(request);
      this.message = '';
    } catch (error: any) {
      this.message = error?.error?.detail ?? error?.message ?? 'No se pudo calcular el resumen.';
      this.toast.error(this.message);
    }
  }

  async submit(): Promise<void> {
    if (!this.auth.token || this.cart.snapshot.length === 0) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      if (!this.preview) {
        await this.refreshPreview();
      }

      const payload: PlaceOrderRequest = {
        customerName: this.customerName,
        customerPhone: this.customerPhone,
        customerNit: this.customerNit || null,
        serviceType: this.serviceType,
        notes: this.notes || null,
        items: this.cart.snapshot.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await this.commerceOrderService.create(payload, this.auth.token);
      this.orderResult = response;
      this.cart.clear();
      this.toast.success('Pedido creado con exito.');
    } catch (error: any) {
      if (error?.status === 0) {
        this.message = 'No hay conexion con backend. Levanta la API en http://localhost:5088.';
      } else if (error?.status === 401) {
        this.message = 'Sesion expirada. Inicia sesion nuevamente.';
      } else {
        this.message = error?.error?.detail ?? error?.message ?? 'No se pudo crear el pedido.';
      }
      this.toast.error(this.message);
    } finally {
      this.loading = false;
    }
  }

  async loadInvoice(): Promise<void> {
    if (!this.orderResult?.orderId || !this.auth.token) {
      return;
    }

    this.loadingInvoice = true;
    try {
      this.invoice = await this.commerceOrderService.getInvoice(this.orderResult.orderId, this.auth.token);
    } catch (error: any) {
      const message = error?.error?.detail ?? error?.message ?? 'No se pudo cargar la factura.';
      this.toast.error(message);
    } finally {
      this.loadingInvoice = false;
    }
  }

  printInvoice(): void {
    window.print();
  }
}
