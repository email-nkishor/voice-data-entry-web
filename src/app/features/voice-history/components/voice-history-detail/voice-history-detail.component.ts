import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeyValuePipe } from '@angular/common';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { VoiceEntryService } from '../../../../core/services/voice-entry.service';
import {
  VoiceEntryEditRecord,
  VoiceEntryRecord,
} from '../../../../core/models/voice-entry.model';

@Component({
  selector: 'app-voice-history-detail',
  standalone: true,
  imports: [KeyValuePipe, ModuleActionHeaderComponent],
  templateUrl: './voice-history-detail.component.html',
  styleUrl: './voice-history-detail.component.scss',
})
export class VoiceHistoryDetailComponent implements OnInit {
  entry: VoiceEntryRecord | null = null;
  edits: VoiceEntryEditRecord[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private voiceEntryService: VoiceEntryService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      const [entry, edits] = await Promise.all([
        this.voiceEntryService.getById(id),
        this.voiceEntryService.getEdits(id).catch(() => []),
      ]);
      this.entry = entry ?? null;
      this.edits = edits;
      if (!this.entry) {
        this.toast.error('Voice entry not found');
      }
    } catch {
      this.toast.error('Failed to load voice entry');
    } finally {
      this.loading = false;
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('en-IN');
  }

  parseEditValue(value: string | null): string {
    if (!value) {
      return '—';
    }
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch {
      return value;
    }
  }
}
