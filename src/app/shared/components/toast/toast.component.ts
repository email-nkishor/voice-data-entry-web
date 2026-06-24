import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div class="toast" [class.toast-success]="message.type === 'success'" [class.toast-error]="message.type === 'error'">
        {{ message.text }}
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2000;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2);
      max-width: min(90vw, 420px);
      text-align: center;
    }

    .toast-success {
      background: #16a34a;
    }

    .toast-error {
      background: #dc2626;
    }

    .toast:not(.toast-success):not(.toast-error) {
      background: #2563eb;
    }
  `,
})
export class ToastComponent implements OnInit, OnDestroy {
  message: ToastMessage | null = null;
  private subscription?: Subscription;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((message) => {
      this.message = message;
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      this.hideTimer = setTimeout(() => {
        this.message = null;
      }, 2800);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }
}
