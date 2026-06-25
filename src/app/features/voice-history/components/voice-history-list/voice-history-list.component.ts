import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { VoiceEntryService } from '../../../../core/services/voice-entry.service';
import {
  VoiceEntryRecord,
  VoiceEntryStats,
  VoiceEntryStatus,
} from '../../../../core/models/voice-entry.model';

@Component({
  selector: 'app-voice-history-list',
  standalone: true,
  imports: [RouterLink, FormsModule, ModuleActionHeaderComponent],
  templateUrl: './voice-history-list.component.html',
  styleUrl: './voice-history-list.component.scss',
})
export class VoiceHistoryListComponent implements OnInit {
  entries: VoiceEntryRecord[] = [];
  stats: VoiceEntryStats | null = null;
  loading = true;
  total = 0;

  search = '';
  statusFilter = '';
  moduleFilter = '';
  fromDate = '';
  toDate = '';

  readonly statusOptions: VoiceEntryStatus[] = ['draft', 'processed', 'saved', 'failed'];

  constructor(
    private voiceEntryService: VoiceEntryService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {}

  get canView(): boolean {
    return this.permissionService.canViewVoiceHistory();
  }

  async ngOnInit(): Promise<void> {
    if (!this.canView) {
      this.loading = false;
      return;
    }
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const [list, stats] = await Promise.all([
        this.voiceEntryService.list({
          search: this.search || undefined,
          status: (this.statusFilter as VoiceEntryStatus) || undefined,
          moduleCode: this.moduleFilter || undefined,
          fromDate: this.fromDate || undefined,
          toDate: this.toDate || undefined,
          limit: 50,
        }),
        this.voiceEntryService.getStats().catch(() => null),
      ]);
      this.entries = list.items;
      this.total = list.total;
      this.stats = stats;
    } catch {
      this.toast.error('Failed to load voice history. Ensure API is online.');
    } finally {
      this.loading = false;
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  statusClass(status: string): string {
    return `status-${status}`;
  }
}
