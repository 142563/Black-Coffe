import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error';

export interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly state = new BehaviorSubject<ToastState | null>(null);
  private currentId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly toast$ = this.state.asObservable();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.state.next(null);
  }

  private show(type: ToastType, message: string): void {
    this.currentId += 1;
    this.state.next({ id: this.currentId, type, message });

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.state.next(null);
      this.timer = null;
    }, 2500);
  }
}
