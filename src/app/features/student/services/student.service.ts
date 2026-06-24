import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { StudentActivityService } from './student-activity.service';
import {
  deriveStudentStatus,
  formatStudentCode,
  Student,
  StudentStatus,
} from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService,
    private activityService: StudentActivityService
  ) {}

  async getAll(): Promise<Student[]> {
    return this.databaseService.db.students.orderBy('createdDate').reverse().toArray();
  }

  async getByGroup(groupId?: number | 'all'): Promise<Student[]> {
    const all = await this.getAll();
    if (!groupId || groupId === 'all') {
      return all;
    }
    return all.filter((student) => student.groupId === groupId);
  }

  async getById(id: number): Promise<Student | undefined> {
    return this.databaseService.db.students.get(id);
  }

  async search(term: string, groupId?: number | 'all'): Promise<Student[]> {
    const like = term.toLowerCase();
    const pool = await this.getByGroup(groupId);
    return pool.filter((student) => {
      const haystack = [
        student.name,
        student.class,
        student.rollNo,
        student.mobile,
        student.address,
        student.admissionNo,
        student.parentName,
        student.parentMobile,
        student.academicYear,
        student.section,
        student.status,
        student.feeStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(like);
    });
  }

  async add(student: Student): Promise<number> {
    const now = new Date().toISOString();
    const record: Student = {
      ...student,
      status: student.status ?? deriveStudentStatus(student),
      feeStatus: student.feeStatus ?? 'not_applicable',
      createdDate: student.createdDate || now,
      updatedDate: now,
      syncStatus: 'pending',
    };
    const id = await this.databaseService.db.students.add(record);
    await this.activityService.log(id, 'create', `Student (${formatStudentCode(id)}) created`);
    await this.syncQueueService.enqueue('student', 'create', { ...record, id }, id);
    return id;
  }

  async update(student: Student): Promise<void> {
    const now = new Date().toISOString();
    const record: Student = {
      ...student,
      updatedDate: now,
      syncStatus: 'pending',
    };
    await this.databaseService.db.students.put(record);
    await this.activityService.log(
      student.id!,
      'update',
      `Student (${formatStudentCode(student.id!)}) updated`
    );
    await this.syncQueueService.enqueue('student', 'update', record, student.id);
  }

  async delete(id: number): Promise<void> {
    await this.activityService.log(id, 'delete', `Student (${formatStudentCode(id)}) deleted`);
    await this.databaseService.db.students.delete(id);
    await this.syncQueueService.enqueue('student', 'delete', { id }, id);
  }

  async approveAdmission(id: number): Promise<void> {
    const student = await this.getById(id);
    if (!student) {
      return;
    }
    await this.update({ ...student, status: 'active' });
    await this.activityService.log(
      id,
      'admission_approved',
      `Admission approved for ${student.name}`
    );
  }

  async updateStatus(id: number, status: StudentStatus): Promise<void> {
    const student = await this.getById(id);
    if (!student) {
      return;
    }
    await this.update({ ...student, status });
    await this.activityService.log(
      id,
      'status_change',
      `Status changed to ${status} for ${student.name}`
    );
  }

  async markSynced(id: number, serverId: number): Promise<void> {
    const student = await this.getById(id);
    if (!student) {
      return;
    }
    await this.databaseService.db.students.update(id, {
      syncStatus: 'synced',
      serverId,
    });
  }
}
