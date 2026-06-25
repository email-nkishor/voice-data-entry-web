import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SyncService } from '../../../core/services/sync.service';
import type { SyncState } from '../../../core/services/sync.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-sync-bar',
  standalone: true,
  template: `
    <section class="sync-bar card" [class.offline]="!state.apiOnline">
      <div class="sync-meta">
        <i class="fa-solid" [class.fa-cloud]="state.apiOnline" [class.fa-cloud-slash]="!state.apiOnline"></i>
        <span>
          @if (state.isSyncing) {
            Syncing…
          } @else if (state.pendingCount > 0) {
            {{ state.pendingCount }} pending change(s)
          } @else if (state.lastSyncedAt) {
            Synced {{ formatRelative(state.lastSyncedAt) }}
          } @else {
            Ready to sync
          }
        </span>
      </div>
      <button type="button" class="btn btn-outline btn-sm" [disabled]="state.isSyncing" (click)="syncNow()">
        <i class="fa-solid fa-rotate"></i> Sync now
      </button>
    </section>
    @if (state.lastError) {
      <p class="sync-error">{{ state.lastError }}</p>
    }
  `,
  styles: [`
    .sync-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .sync-bar.offline { border-color: #f59e0b; }
    .sync-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .sync-error { color: #b91c1c; font-size: 0.85rem; margin: -0.5rem 0 1rem; }
  `],
})
export class SyncBarComponent implements OnInit, OnDestroy {
  state: SyncState = {
    isSyncing: false,
    lastSyncedAt: null,
    pendingCount: 0,
    lastError: null,
    apiOnline: false,
  };
  private sub?: Subscription;

  constructor(
    private syncService: SyncService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.state = this.syncService.state;
    void this.syncService.refreshPendingCount();
    void this.syncService.checkApiOnline();
    this.sub = this.syncService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async syncNow(): Promise<void> {
    try {
      const result = await this.syncService.syncAll();
      this.toast.success(`Sync complete (${result.synced} pushed, ${result.failed} failed)`);
    } catch {
      this.toast.error('Sync failed — check API connection');
    }
  }

  formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  }
}
