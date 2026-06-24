import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SyncService } from '../../../core/services/sync.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-sync-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sync-bar.component.html',
  styleUrl: './sync-bar.component.scss',
})
export class SyncBarComponent implements OnInit {
  private syncService = inject(SyncService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  state$ = this.syncService.state$;

  ngOnInit(): void {
    void this.syncService.refreshPendingCount();
    void this.syncService.checkApiOnline();
  }

  get showBar(): boolean {
    return this.authService.isLoggedIn;
  }

  async onSync(): Promise<void> {
    try {
      const result = await this.syncService.syncAll();
      if (result.synced === 0 && result.failed === 0) {
        this.toastService.success('Nothing to sync');
      } else {
        this.toastService.success(`Synced ${result.synced} item(s)`);
      }
    } catch {
      this.toastService.error(this.syncService.state.lastError ?? 'Sync failed');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
