import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-module-action-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './module-action-header.component.html',
  styleUrl: './module-action-header.component.scss',
})
export class ModuleActionHeaderComponent {
  @Input() title = '';
  @Input() homeLink = '/dashboard';
  @Input() backLink = '/dashboard';
  @Input() showSave = false;
  @Input() showReset = false;
  @Input() showBack = true;
  @Input() showLogout = false;
  @Input() showDividerBeforeBack: boolean | undefined;

  @Output() save = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  get dividerBeforeBack(): boolean {
    if (this.showDividerBeforeBack !== undefined) {
      return this.showDividerBeforeBack;
    }
    return this.showSave || this.showReset;
  }
}
