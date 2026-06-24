import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { Student } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<Student[]> {
    return this.databaseService.db.students
      .orderBy('createdDate')
      .reverse()
      .toArray();
  }

  async getById(id: number): Promise<Student | undefined> {
    return this.databaseService.db.students.get(id);
  }

  async search(term: string): Promise<Student[]> {
    const like = term.toLowerCase();
    return this.databaseService.db.students
      .filter(
        (student) =>
          student.name.toLowerCase().includes(like) ||
          student.class.toLowerCase().includes(like) ||
          student.rollNo.toLowerCase().includes(like) ||
          student.mobile.toLowerCase().includes(like)
      )
      .toArray();
  }

  async add(student: Student): Promise<number> {
    const record: Student = {
      ...student,
      syncStatus: 'pending',
    };
    const id = await this.databaseService.db.students.add(record);
    await this.syncQueueService.enqueue('student', 'create', { ...record, id });
    return id;
  }

  async update(student: Student): Promise<void> {
    const record: Student = { ...student, syncStatus: 'pending' };
    await this.databaseService.db.students.put(record);
    await this.syncQueueService.enqueue('student', 'update', record, student.id);
  }

  async delete(id: number): Promise<void> {
    await this.databaseService.db.students.delete(id);
    await this.syncQueueService.enqueue('student', 'delete', { id }, id);
  }
}
