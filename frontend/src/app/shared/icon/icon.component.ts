import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-icon',
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.stroke-width]="strokeWidth"
      [ngClass]="className"
      aria-hidden="true"
    >
      <ng-container [ngSwitch]="name">
        <ng-container *ngSwitchCase="'coffee'">
          <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"></path>
          <path d="M17 11h2a2 2 0 0 1 0 4h-2"></path>
          <path d="M8 4v2M12 4v2M16 4v2"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'spark'">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4"></path>
          <path d="M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'menu'">
          <path d="M4 7h16M4 12h16M4 17h16"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'cart'">
          <path d="M4 5h2l2.4 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H7"></path>
          <circle cx="10" cy="19" r="1.2"></circle>
          <circle cx="17" cy="19" r="1.2"></circle>
        </ng-container>

        <ng-container *ngSwitchCase="'calendar'">
          <rect x="3.5" y="5" width="17" height="15" rx="2"></rect>
          <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'user'">
          <circle cx="12" cy="8" r="3.2"></circle>
          <path d="M5 20a7 7 0 0 1 14 0"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'map-pin'">
          <path d="M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11z"></path>
          <circle cx="12" cy="10" r="2"></circle>
        </ng-container>

        <ng-container *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="8"></circle>
          <path d="M12 8v4l2.8 2"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'check'">
          <path d="M5 13l4 4L19 7"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'arrow-right'">
          <path d="M5 12h14"></path>
          <path d="M13 6l6 6-6 6"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'cup'">
          <path d="M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"></path>
          <path d="M17 10h2a2 2 0 1 1 0 4h-2"></path>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <circle cx="12" cy="12" r="8"></circle>
        </ng-container>
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input() name = 'spark';
  @Input() size = 20;
  @Input() strokeWidth = 1.8;
  @Input() className = '';
}
