import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import {
  Attendance,
  AttendanceStatus,
  AttendanceWithStudent,
} from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<AttendanceWithStudent[]> {
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

  async add(attendance: Attendance): Promise<void> {
    const record = { ...attendance, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.attendance.add(record);
    await this.syncQueueService.enqueue('attendance', 'create', { ...record, id });
  }

  getStatusOptions(): AttendanceStatus[] {
    return ['Present', 'Absent'];
  }
}
