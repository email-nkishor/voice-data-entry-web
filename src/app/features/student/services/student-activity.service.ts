import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { StudentActivity } from '../models/student-activity.model';
import { formatStudentCode } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentActivityService {
  constructor(private databaseService: DatabaseService) {}

  async log(
    studentId: number,
    action: StudentActivity['action'],
    message?: string
  ): Promise<void> {
    const dateLabel = this.formatDate(new Date());
    const activity: StudentActivity = {
      studentId,
      action,
      message: message ?? `Student (${formatStudentCode(studentId)}) ${action}`,
      actionDate: dateLabel,
      loggedDate: dateLabel,
    };
    await this.databaseService.db.studentActivities.add(activity);
  }

  async getRecent(limit = 10, studentId?: number): Promise<StudentActivity[]> {
    if (studentId) {
      return this.databaseService.db.studentActivities
        .where('studentId')
        .equals(studentId)
        .reverse()
        .limit(limit)
        .toArray();
    }
    return this.databaseService.db.studentActivities
      .orderBy('id')
      .reverse()
      .limit(limit)
      .toArray();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
