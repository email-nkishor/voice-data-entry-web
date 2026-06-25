import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Organization } from '../../../../core/models/organization.model';

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  template: `
    <section class="page">
      <app-module-action-header title="Organization Settings" backLink="/dashboard" />
      @if (org) {
        <div class="card settings-card">
          <h2>{{ org.name }}</h2>
          <p class="code">{{ org.code }}</p>

          <label class="toggle-row">
            <div>
              <strong>Parent Portal</strong>
              <p>Enable the parent/guardian portal for this school. When disabled, parent users cannot access child data.</p>
            </div>
            <input type="checkbox" [(ngModel)]="parentPortalEnabled" (change)="onPortalToggle()" />
          </label>

          <label class="toggle-row" [class.disabled]="!parentPortalEnabled">
            <div>
              <strong>Parent Attendance Views</strong>
              <p>Allow parents to view child attendance summaries, daily records, and absence alerts. Requires Parent Portal.</p>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="parentAttendanceEnabled"
              [disabled]="!parentPortalEnabled"
              (change)="onAttendanceToggle()"
            />
          </label>

          <div class="meta-grid">
            <div><span>Timezone</span><strong>{{ org.settings.timezone || '—' }}</strong></div>
            <div><span>Academic Year</span><strong>{{ org.settings.academicYear || '—' }}</strong></div>
          </div>
        </div>
      } @else {
        <p class="empty">Loading organization…</p>
      }
    </section>
  `,
  styles: [`
    .settings-card { padding: 1.25rem; max-width: 640px; }
    .code { color: #6b7280; margin-top: 0; }
    .toggle-row {
      display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start;
      padding: 1rem 0; border-top: 1px solid #e5e7eb;
      p { margin: 0.35rem 0 0; color: #6b7280; font-size: 0.9rem; max-width: 420px; }
      input { width: 20px; height: 20px; margin-top: 0.25rem; }
    }
    .toggle-row.disabled { opacity: 0.55; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
    .meta-grid span { display: block; font-size: 0.75rem; color: #6b7280; }
    .empty { color: #6b7280; }
  `],
})
export class OrganizationSettingsComponent implements OnInit {
  org: Organization | null = null;
  parentPortalEnabled = false;
  parentAttendanceEnabled = false;
  saving = false;

  constructor(
    private orgService: OrganizationService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.org = await this.orgService.loadCurrent();
    this.parentPortalEnabled = this.org.parentPortalEnabled;
    this.parentAttendanceEnabled =
      this.org.parentAttendanceEnabled === true ||
      this.org.settings.parentAttendanceEnabled === true;
  }

  async onPortalToggle(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      if (!this.parentPortalEnabled) {
        this.parentAttendanceEnabled = false;
      }
      this.org = await this.orgService.setParentPortalEnabled(this.parentPortalEnabled);
      if (!this.parentPortalEnabled) {
        this.parentAttendanceEnabled = false;
      }
      this.toast.success(this.parentPortalEnabled ? 'Parent portal enabled' : 'Parent portal disabled');
    } catch {
      this.parentPortalEnabled = !this.parentPortalEnabled;
      this.toast.error('Failed to update setting');
    } finally {
      this.saving = false;
    }
  }

  async onAttendanceToggle(): Promise<void> {
    if (this.saving || !this.parentPortalEnabled) return;
    this.saving = true;
    try {
      this.org = await this.orgService.setParentAttendanceEnabled(this.parentAttendanceEnabled);
      this.toast.success(
        this.parentAttendanceEnabled ? 'Parent attendance views enabled' : 'Parent attendance views disabled'
      );
    } catch {
      this.parentAttendanceEnabled = !this.parentAttendanceEnabled;
      this.toast.error('Failed to update setting');
    } finally {
      this.saving = false;
    }
  }
}
