import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import {
  Attendance,
  AttendanceContextType,
  AttendanceGridRow,
  AttendanceStatus,
  AttendanceSummary,
  AttendanceWithStudent,
} from '../models/attendance.model';
import { DatabaseService } from '../../../core/services/database.service';

export interface AttendanceApiRecord {
  id: number;
  studentId: number;
  groupId: number | null;
  eventId: number | null;
  attendanceDate: string;
  contextType: AttendanceContextType;
  periodNumber: number | null;
  status: AttendanceStatus;
  remarks: string | null;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  getStatusOptions(): AttendanceStatus[] {
    return ['present', 'absent', 'late', 'excused'];
  }

  statusLabel(status: AttendanceStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  async listFromApi(filters?: {
    date?: string;
    groupId?: number;
    contextType?: AttendanceContextType;
  }): Promise<AttendanceApiRecord[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.groupId) params.set('groupId', String(filters.groupId));
    if (filters?.contextType) params.set('contextType', filters.contextType);
    const qs = params.toString();
    return this.api.get<AttendanceApiRecord[]>(`/attendance${qs ? `?${qs}` : ''}`);
  }

  getDailyGrid(groupId: number, date: string): Promise<AttendanceGridRow[]> {
    return this.api.get<AttendanceGridRow[]>(`/attendance/daily/${date}/${groupId}`);
  }

  bulkMark(payload: {
    groupId: number;
    attendanceDate: string;
    contextType?: AttendanceContextType;
    periodNumber?: number;
    records: { studentId: number; status: AttendanceStatus; remarks?: string }[];
  }): Promise<AttendanceApiRecord[]> {
    return this.api.post<AttendanceApiRecord[]>('/attendance/bulk', payload);
  }

  getSummary(filters?: { groupId?: number; fromDate?: string; toDate?: string }): Promise<AttendanceSummary> {
    const params = new URLSearchParams();
    if (filters?.groupId) params.set('groupId', String(filters.groupId));
    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);
    const qs = params.toString();
    return this.api.get<AttendanceSummary>(`/attendance/reports/summary${qs ? `?${qs}` : ''}`);
  }

  /** Offline IndexedDB fallback */
  async getAllLocal(): Promise<AttendanceWithStudent[]> {
    const records = await this.databaseService.db.attendance
      .orderBy('attendanceDate')
      .reverse()
      .toArray();
    const students = await this.databaseService.db.students.toArray();
    const studentMap = new Map(students.map((s) => [s.id!, s.name]));
    return records.map((record) => ({
      ...record,
      studentName: studentMap.get(record.studentId),
    }));
  }

  async addLocal(attendance: Attendance): Promise<void> {
    const record = { ...attendance, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.attendance.add(record);
    await this.syncQueueService.enqueue(
      'attendance',
      attendance.serverId ? 'update' : 'create',
      { ...record, id },
      id
    );
  }
}
