import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import {
  DashboardOverview,
  ReportExportEntity,
  ReportFilters,
  ReportModule,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService
  ) {}

  private buildQuery(filters: ReportFilters): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  getOverview(filters: ReportFilters = {}): Promise<DashboardOverview> {
    return this.api
      .get<DashboardOverview>(`/reports/overview${this.buildQuery(filters)}`)
      .then(async (data) => {
        await this.databaseService.db.reportSnapshots.put({
          id: 'overview',
          data,
          cachedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch(() => this.getCachedOverview());
  }

  getModuleAnalytics(module: ReportModule, filters: ReportFilters = {}): Promise<Record<string, unknown>> {
    if (module === 'overview') {
      return this.getOverview(filters).then((data) => data as unknown as Record<string, unknown>);
    }
    return this.api.get(`/reports/${module}${this.buildQuery(filters)}`);
  }

  getActivity(limit = 20): Promise<unknown[]> {
    return this.api.get(`/reports/activity?limit=${limit}`);
  }

  async exportData(
    entity: ReportExportEntity,
    format: 'csv' | 'excel' = 'csv',
    filters: ReportFilters = {}
  ): Promise<void> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    params.set('format', format);
    const blob = await this.api.download(`/reports/export/${entity}?${params.toString()}`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entity}-export.${format === 'excel' ? 'xls' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async getCachedOverview(): Promise<DashboardOverview> {
    const cached = await this.databaseService.db.reportSnapshots.get('overview');
    if (cached?.data) {
      return cached.data;
    }
    throw new Error('No cached report data');
  }
}
