import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-grid">
      <article class="panel auth-aside fade-up">
        <p class="section__eyebrow">BLACK COFFE</p>
        <h1 class="section__title">{{ mode === 'login' ? 'Bienvenido' : 'Nueva cuenta' }}</h1>
        <p class="section__copy">Más que una bebida... es un estilo de vida.</p>
        <p class="section__copy section__copy--small">
          {{ mode === 'login'
            ? 'Ingresa con tu cuenta para ver perfil, pedidos y reservas.'
            : 'Crea tu cuenta para comenzar a pedir desde el menú interactivo.' }}
        </p>
        <button *ngIf="mode === 'login'" class="btn btn-outline" type="button" (click)="useDemoAccount()">USAR DEMO</button>
      </article>

      <article class="panel auth-form fade-up" style="--delay: 80ms;">
        <h2 class="section__title section__title--md">{{ mode === 'login' ? 'Login' : 'Create Account' }}</h2>
        <form class="form" (ngSubmit)="submit()">
          <input *ngIf="mode === 'register'" [(ngModel)]="fullName" name="fullName" placeholder="Nombre completo" required />
          <input [(ngModel)]="email" name="email" type="email" placeholder="Email" required />
          <input *ngIf="mode === 'register'" [(ngModel)]="phone" name="phone" placeholder="Teléfono" required />
          <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />

          <div class="row-actions row-actions--stretch">
            <button class="btn" [disabled]="loading">{{ mode === 'login' ? 'INGRESAR' : 'CREAR CUENTA' }}</button>
            <button class="btn btn-outline" type="button" (click)="toggleMode()">
              {{ mode === 'login' ? 'IR A CREATE ACCOUNT' : 'VOLVER A LOGIN' }}
            </button>
          </div>
        </form>

        <p class="message" *ngIf="message">{{ message }}</p>
        <p class="message message--soft">Demo: {{ demoEmail }} / {{ demoPassword }}</p>
      </article>
    </section>
  `
})
export class LoginPageComponent {
  readonly demoEmail = 'julio.cesar.ticas.demo@blackcoffe.local';
  readonly demoPassword = 'DemoCafe123*';

  mode: 'login' | 'register' = 'login';
  fullName = '';
  email = this.demoEmail;
  phone = '';
  password = this.demoPassword;
  message = '';
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.message = '';
  }

  useDemoAccount(): void {
    this.mode = 'login';
    this.email = this.demoEmail;
    this.password = this.demoPassword;
    this.message = '';
  }

  async submit(): Promise<void> {
    this.loading = true;
    this.message = '';

    try {
      if (this.mode === 'login') {
        await this.auth.login({ email: this.email, password: this.password });
        this.message = 'Sesion iniciada.';
        this.toast.success(this.message);
        await this.router.navigateByUrl('/profile');
      } else {
        await this.auth.register({ fullName: this.fullName, email: this.email, phone: this.phone, password: this.password });
        this.message = 'Cuenta creada e inicio de sesion exitoso.';
        this.toast.success(this.message);
        await this.router.navigateByUrl('/profile');
      }
    } catch (error: any) {
      if (error?.status === 0) {
        this.message = 'No hay conexion con backend. Levanta primero la API en http://localhost:5088.';
        this.toast.error(this.message);
        return;
      }

      if (error?.status === 401) {
        this.message = 'Credenciales invalidas. Verifica correo y password.';
        this.toast.error(this.message);
        return;
      }

      if (error?.status === 503) {
        this.message = error?.error?.message ?? 'La base de datos no esta disponible en este momento.';
        this.toast.error(this.message);
        return;
      }

      this.message = error?.error?.message ?? error?.message ?? 'Error de autenticacion';
      this.toast.error(this.message);
    } finally {
      this.loading = false;
    }
  }
}
