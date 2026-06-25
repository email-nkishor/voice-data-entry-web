import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import {
  ParentAttendanceRecord,
  ParentAttendanceSummary,
  ParentDashboardData,
  ParentNotificationPreferences,
  ParentProfile,
} from '../models/parent-portal.model';

@Injectable({ providedIn: 'root' })
export class ParentPortalService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService
  ) {}

  getProfile(): Promise<ParentProfile> {
    return this.api.get<ParentProfile>('/parent/profile');
  }

  getDashboard(studentId?: number): Promise<ParentDashboardData> {
    const qs = studentId ? `?studentId=${studentId}` : '';
    return this.api
      .get<ParentDashboardData>(`/parent/dashboard${qs}`)
      .then(async (data) => {
        await this.databaseService.db.parentDashboardSnapshots.put({
          id: studentId ? `dashboard-${studentId}` : 'dashboard-default',
          data,
          cachedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch(() => this.getCachedDashboard(studentId));
  }

  getChildren() {
    return this.api.get('/parent/children');
  }

  getChildDetail(studentId: number) {
    return this.api
      .get(`/parent/children/${studentId}`)
      .then(async (data) => {
        await this.databaseService.db.parentChildProfiles.put({
          id: String(studentId),
          data: data as Record<string, unknown>,
          cachedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch(() => this.getCachedChildProfile(studentId));
  }

  getChildVoice(studentId: number) {
    return this.api.get(`/parent/children/${studentId}/voice-entries`);
  }

  getChildCertificates(studentId: number) {
    return this.api.get(`/parent/children/${studentId}/certificates`);
  }

  getChildAwards(studentId: number) {
    return this.api.get(`/parent/children/${studentId}/awards`);
  }

  getChildEvents(studentId: number) {
    return this.api.get(`/parent/children/${studentId}/events`);
  }

  getChildAttendance(
    studentId: number,
    filters: { fromDate?: string; toDate?: string; contextType?: string } = {}
  ): Promise<ParentAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    if (filters.contextType) params.set('contextType', filters.contextType);
    const qs = params.toString();
    const cacheId = `attendance-${studentId}-${filters.fromDate ?? 'all'}-${filters.toDate ?? 'all'}-${filters.contextType ?? 'all'}`;
    return this.api
      .get<ParentAttendanceRecord[]>(`/parent/children/${studentId}/attendance${qs ? `?${qs}` : ''}`)
      .then(async (data) => {
        await this.databaseService.db.parentChildAttendanceSnapshots.put({
          id: cacheId,
          studentId,
          data,
          cachedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch(() => this.getCachedChildAttendance(cacheId));
  }

  getChildAttendanceSummary(
    studentId: number,
    filters: { fromDate?: string; toDate?: string } = {}
  ): Promise<ParentAttendanceSummary> {
    const params = new URLSearchParams();
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    const qs = params.toString();
    const cacheId = `attendance-summary-${studentId}-${filters.fromDate ?? 'all'}-${filters.toDate ?? 'all'}`;
    return this.api
      .get<ParentAttendanceSummary>(`/parent/children/${studentId}/attendance/summary${qs ? `?${qs}` : ''}`)
      .then(async (data) => {
        await this.databaseService.db.parentChildAttendanceSnapshots.put({
          id: cacheId,
          studentId,
          summary: data,
          cachedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch(() => this.getCachedChildAttendanceSummary(cacheId));
  }

  logCertificateDownload(studentId: number, certificateId: number) {
    return this.api.post(`/parent/children/${studentId}/certificates/${certificateId}/download`, {});
  }

  logCertificateVerify(studentId: number, certificateId: number) {
    return this.api.post(`/parent/children/${studentId}/certificates/${certificateId}/verify`, {});
  }

  getNotificationPreferences(): Promise<ParentNotificationPreferences> {
    return this.api.get<ParentNotificationPreferences>('/parent/notification-preferences');
  }

  updateNotificationPreferences(prefs: Partial<ParentNotificationPreferences>) {
    return this.api.put<ParentNotificationPreferences>('/parent/notification-preferences', prefs);
  }

  private async getCachedDashboard(studentId?: number): Promise<ParentDashboardData> {
    const id = studentId ? `dashboard-${studentId}` : 'dashboard-default';
    const cached = await this.databaseService.db.parentDashboardSnapshots.get(id);
    if (cached?.data) {
      return cached.data;
    }
    throw new Error('No cached parent dashboard');
  }

  private async getCachedChildProfile(studentId: number) {
    const cached = await this.databaseService.db.parentChildProfiles.get(String(studentId));
    if (cached?.data) {
      return cached.data;
    }
    throw new Error('No cached child profile');
  }

  private async getCachedChildAttendance(cacheId: string): Promise<ParentAttendanceRecord[]> {
    const cached = await this.databaseService.db.parentChildAttendanceSnapshots.get(cacheId);
    if (cached?.data) {
      return cached.data;
    }
    throw new Error('No cached child attendance');
  }

  private async getCachedChildAttendanceSummary(cacheId: string): Promise<ParentAttendanceSummary> {
    const cached = await this.databaseService.db.parentChildAttendanceSnapshots.get(cacheId);
    if (cached?.summary) {
      return cached.summary;
    }
    throw new Error('No cached attendance summary');
  }
}
