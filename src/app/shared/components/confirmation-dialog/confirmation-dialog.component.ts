import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  template: `
    <div class="dialog-backdrop" role="dialog" aria-modal="true">
      <div class="dialog-card card">
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-outline" (click)="cancelled.emit()">
            {{ cancelText }}
          </button>
          <button type="button" class="btn btn-danger" (click)="confirmed.emit()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Yes';
  @Input() cancelText = 'No';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
