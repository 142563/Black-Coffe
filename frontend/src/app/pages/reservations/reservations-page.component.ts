import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TableDto } from '../../models/reservation.models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-reservations-page',
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <section class="panel section" *ngIf="!auth.isLoggedIn">
      <p class="section__eyebrow">RESERVAS</p>
      <h2 class="section__title">Inicia sesion para reservar</h2>
    </section>

    <section class="panel section" *ngIf="auth.isLoggedIn && loadingTables">
      <p class="section__eyebrow">RESERVAS</p>
      <h2 class="section__title">Cargando mesas</h2>
      <div class="skeleton-grid">
        <article class="skeleton-card" *ngFor="let item of skeletonRows">
          <div class="skeleton-line skeleton-line--lg w-2/3"></div>
          <div class="mt-3 space-y-2">
            <div class="skeleton-line w-full"></div>
            <div class="skeleton-line w-10/12"></div>
          </div>
        </article>
      </div>
    </section>

    <section class="empty-state" *ngIf="auth.isLoggedIn && !loadingTables && tables.length === 0">
      <app-icon name="calendar" [size]="40" className="empty-state__icon"></app-icon>
      <h2 class="section__title section__title--md">Aun no tienes reservas</h2>
      <p class="section__copy">No hay mesas disponibles en este momento. Intenta mas tarde.</p>
      <div class="row-actions justify-center">
        <button class="btn-outline" type="button" (click)="reloadTables()">Reintentar</button>
      </div>
    </section>

    <section class="panel section" *ngIf="auth.isLoggedIn && !loadingTables && tables.length > 0">
      <p class="section__eyebrow">RESERVAS</p>
      <h1 class="section__title">Reserva tu mesa</h1>
      <p class="section__copy">Selecciona mesa, fecha y cantidad de personas para confirmar tu visita.</p>

      <form class="form reservation-form-grid" (ngSubmit)="submit()">
        <div class="grid gap-3">
          <label class="input-label">Mesa</label>
          <select [(ngModel)]="tableId" name="tableId" required>
            <option *ngFor="let table of tables" [value]="table.id">{{ table.name }} ({{ table.capacity }})</option>
          </select>
        </div>

        <div class="grid gap-3">
          <label class="input-label">Fecha y hora</label>
          <input [(ngModel)]="reservationAtUtc" name="reservationAtUtc" type="datetime-local" required />
        </div>

        <div class="grid gap-3">
          <label class="input-label">Cantidad de personas</label>
          <input [(ngModel)]="partySize" name="partySize" type="number" min="1" required />
        </div>

        <div class="grid gap-3 reservation-notes">
          <label class="input-label">Notas</label>
          <textarea [(ngModel)]="notes" name="notes" placeholder="Notas"></textarea>
        </div>

        <div class="row-actions row-actions--stretch">
          <button class="btn-primary" [disabled]="loading">Crear reserva</button>
        </div>
      </form>

      <p class="message" *ngIf="message">{{ message }}</p>
    </section>
  `
})
export class ReservationsPageComponent implements OnInit {
  readonly skeletonRows = Array.from({ length: 3 }, (_, index) => index);

  tables: TableDto[] = [];
  tableId = '';
  reservationAtUtc = '';
  partySize = 1;
  notes = '';
  message = '';
  loading = false;
  loadingTables = true;

  constructor(
    public readonly auth: AuthService,
    private readonly api: ApiService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.auth.token) {
      this.loadingTables = false;
      return;
    }

    await this.reloadTables();
  }

  async reloadTables(): Promise<void> {
    if (!this.auth.token) {
      return;
    }

    this.loadingTables = true;
    this.message = '';

    try {
      this.tables = await this.api.get<TableDto[]>('/admin/tables', this.auth.token);
      if (this.tables.length > 0) {
        this.tableId = this.tables[0].id;
      }
    } catch {
      this.tables = [];
      this.message = 'No se pudieron cargar las mesas. Verifica que tu usuario tenga rol Admin o Staff.';
      this.toast.error(this.message);
    } finally {
      this.loadingTables = false;
    }
  }

  async submit(): Promise<void> {
    if (!this.auth.token) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      await this.api.post('/reservations', {
        tableId: this.tableId,
        reservationAtUtc: new Date(this.reservationAtUtc).toISOString(),
        partySize: Number(this.partySize),
        notes: this.notes
      }, this.auth.token);

      this.message = 'Reserva creada con exito.';
      this.toast.success(this.message);
    } catch (error: unknown) {
      const httpError = error as { error?: { message?: string }; message?: string };
      this.message = httpError?.error?.message ?? httpError?.message ?? 'No se pudo crear la reserva';
      this.toast.error(this.message);
    } finally {
      this.loading = false;
    }
  }
}
