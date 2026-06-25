import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ParentNotificationPreferences } from '../../../../core/models/parent-portal.model';

@Component({
  selector: 'app-parent-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="settings card">
      <h2>Notification Preferences</h2>
      <p class="hint">Foundation for future email, SMS, and push notifications.</p>
      @if (prefs) {
        <div class="toggles">
          <label><input type="checkbox" [(ngModel)]="prefs.emailEnabled" /> Email notifications</label>
          <label><input type="checkbox" [(ngModel)]="prefs.smsEnabled" /> SMS notifications</label>
          <label><input type="checkbox" [(ngModel)]="prefs.pushEnabled" /> Push notifications</label>
          <label><input type="checkbox" [(ngModel)]="prefs.eventAssigned" /> Event assigned</label>
          <label><input type="checkbox" [(ngModel)]="prefs.certificateIssued" /> Certificate issued</label>
          <label><input type="checkbox" [(ngModel)]="prefs.awardAdded" /> Award added</label>
          <label><input type="checkbox" [(ngModel)]="prefs.attendanceAlert" /> Attendance alert</label>
        </div>
        <button type="button" class="btn btn-primary" [disabled]="saving" (click)="save()">Save preferences</button>
      } @else {
        <p class="empty">Loading…</p>
      }
    </section>
  `,
  styles: [`
    .settings { padding: 1rem 1.25rem; max-width: 480px; }
    .hint { color: #6b7280; font-size: 0.9rem; }
    .toggles { display: flex; flex-direction: column; gap: 0.6rem; margin: 1rem 0; }
    label { display: flex; align-items: center; gap: 0.5rem; }
    .empty { color: #6b7280; }
  `],
})
export class ParentSettingsComponent implements OnInit {
  prefs: ParentNotificationPreferences | null = null;
  saving = false;

  constructor(
    private parentPortal: ParentPortalService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.prefs = await this.parentPortal.getNotificationPreferences();
  }

  async save(): Promise<void> {
    if (!this.prefs) return;
    this.saving = true;
    try {
      this.prefs = await this.parentPortal.updateNotificationPreferences(this.prefs);
      this.toast.success('Preferences saved');
    } catch {
      this.toast.error('Failed to save preferences');
    } finally {
      this.saving = false;
    }
  }
}
