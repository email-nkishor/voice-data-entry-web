import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ReportService } from '../../../../core/services/report.service';
import { StudentGroupService } from '../../../student/services/student-group.service';
import { StudentGroup } from '../../../student/models/student-group.model';
import {
  DashboardOverview,
  ReportExportEntity,
  ReportModule,
  TrendPoint,
} from '../../../../core/models/report.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule, KeyValuePipe, ModuleActionHeaderComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss',
})
export class ReportsDashboardComponent implements OnInit {
  overview: DashboardOverview | null = null;
  moduleData: Record<string, unknown> | null = null;
  groups: StudentGroup[] = [];
  loading = true;
  exporting = false;

  activeModule: ReportModule = 'overview';
  fromDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  toDate = new Date().toISOString().slice(0, 10);
  groupId: number | null = null;

  readonly modules: { id: ReportModule; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'voice', label: 'Voice' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'awards', label: 'Awards' },
    { id: 'events', label: 'Events' },
  ];

  readonly exportEntities: ReportExportEntity[] = [
    'students',
    'voice',
    'certificates',
    'awards',
    'events',
    'audit',
  ];

  constructor(
    private reportService: ReportService,
    private groupService: StudentGroupService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {}

  get canView(): boolean {
    return this.permissionService.canViewReports();
  }

  async ngOnInit(): Promise<void> {
    if (!this.canView) {
      this.loading = false;
      return;
    }
    this.groups = await this.groupService.getAll();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const filters = this.currentFilters();
      if (this.activeModule === 'overview') {
        this.overview = await this.reportService.getOverview(filters);
        this.moduleData = null;
      } else {
        this.moduleData = await this.reportService.getModuleAnalytics(this.activeModule, filters);
        if (!this.overview) {
          this.overview = await this.reportService.getOverview(filters);
        }
      }
    } catch {
      this.toast.error('Failed to load reports. Showing cached data if available.');
    } finally {
      this.loading = false;
    }
  }

  async setModule(module: ReportModule): Promise<void> {
    this.activeModule = module;
    await this.load();
  }

  async exportEntity(entity: ReportExportEntity, format: 'csv' | 'excel'): Promise<void> {
    this.exporting = true;
    try {
      await this.reportService.exportData(entity, format, this.currentFilters());
      this.toast.success(`${entity} exported as ${format.toUpperCase()}`);
    } catch {
      this.toast.error('Export failed');
    } finally {
      this.exporting = false;
    }
  }

  trendMax(points: TrendPoint[]): number {
    if (!points.length) {
      return 1;
    }
    return Math.max(...points.map((p) => p.count), 1);
  }

  barWidth(count: number, max: number): string {
    return `${Math.round((count / max) * 100)}%`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  moduleLabel(module: ReportModule): string {
    const found = this.modules.find((m) => m.id === module);
    return found?.label ?? module;
  }

  moduleBreakdowns(): { label: string; data: Record<string, number> }[] {
    if (!this.moduleData) {
      return [];
    }
    const d = this.moduleData;
    const panels: { label: string; data: Record<string, number> }[] = [];
    const add = (label: string, key: string) => {
      const data = d[key] as Record<string, number> | undefined;
      if (data && Object.keys(data).length) {
        panels.push({ label, data });
      }
    };
    add('By Status', 'byStatus');
    add('By Class', 'byClass');
    add('By Fee Status', 'byFeeStatus');
    add('By Module', 'byModule');
    add('By Engine', 'byEngine');
    add('By Type', 'byType');
    add('By Category', 'byCategory');
    return panels;
  }

  moduleRecent(): Record<string, unknown>[] {
    if (!this.moduleData) {
      return [];
    }
    const recent = this.moduleData['recent'] ?? this.moduleData['upcoming'];
    return Array.isArray(recent) ? recent : [];
  }

  recentTitle(item: Record<string, unknown>): string {
    return String(item['name'] ?? item['title'] ?? item['number'] ?? item['id'] ?? 'Item');
  }

  recentMeta(item: Record<string, unknown>): string {
    const parts = [
      item['status'],
      item['class'],
      item['category'],
      item['moduleCode'],
      item['eventType'],
    ].filter(Boolean);
    return parts.map(String).join(' · ');
  }

  recentDate(item: Record<string, unknown>): string {
    const date = item['createdAt'] ?? item['issueDate'] ?? item['awardDate'] ?? item['startDate'];
    return date ? this.formatDate(String(date)) : '';
  }

  private currentFilters() {
    return {
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      groupId: this.groupId ?? undefined,
    };
  }
}
