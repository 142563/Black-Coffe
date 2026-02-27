import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ToastService, ToastState } from '../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-toast',
  imports: [CommonModule],
  animations: [
    trigger('toastMotion', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ],
  template: `
    <section class="toast-wrap" *ngIf="toast" @toastMotion>
      <article class="toast" [class.toast--error]="toast.type === 'error'">
        <div class="toast__content">
          <span class="toast__label">{{ toast.type === 'success' ? 'Exito' : 'Error' }}</span>
          <p>{{ toast.message }}</p>
        </div>
        <button type="button" class="toast__close" (click)="close()" aria-label="Cerrar notificacion">x</button>
      </article>
    </section>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: ToastState | null = null;
  private sub?: Subscription;

  constructor(private readonly toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe((value) => {
      this.toast = value;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.toastService.clear();
  }
}
