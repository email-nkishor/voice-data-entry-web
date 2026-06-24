import { Injectable } from '@angular/core';
import {
  DashboardActivity,
  DashboardFavorite,
  DashboardWorklistItem,
  DonutSegment,
} from '../../dashboard/models/student-dashboard.model';
import {
  deriveStudentStatus,
  formatStudentCode,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUS_LABELS,
  Student,
  StudentStatus,
} from '../models/student.model';
import { StudentActivity } from '../models/student-activity.model';
import { StudentActivityService } from './student-activity.service';
import { StudentService } from './student.service';

const CLASS_COLORS = [
  '#16a34a',
  '#22c55e',
  '#4ade80',
  '#0ea5e9',
  '#86efac',
  '#bbf7d0',
  '#a78bfa',
  '#dcfce7',
];

@Injectable({ providedIn: 'root' })
export class StudentDashboardService {
  constructor(
    private studentService: StudentService,
    private activityService: StudentActivityService
  ) {}

  async loadDashboard(groupId?: number | 'all') {
    const students = await this.studentService.getByGroup(groupId);
    const activities = await this.activityService.getRecent(10);

    return {
      statusSegments: this.buildStatusSegments(students),
      classSegments: this.buildClassSegments(students),
      recentActivity: await this.buildRecentActivity(students, activities),
      worklist: this.buildWorklist(students),
      alerts: this.buildAlerts(students),
      favorites: this.buildFavorites(students),
      total: students.length,
    };
  }

  buildStatusSegments(students: Student[]): DonutSegment[] {
    const counts = new Map<StudentStatus, number>();
    for (const student of students) {
      const status = deriveStudentStatus(student);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, value]) => ({
      label: STUDENT_STATUS_LABELS[status],
      value,
      color: STUDENT_STATUS_COLORS[status],
    }));
  }

  buildClassSegments(students: Student[]): DonutSegment[] {
    const counts = new Map<string, number>();
    for (const student of students) {
      const cls = student.class?.trim() || 'Unassigned';
      counts.set(cls, (counts.get(cls) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, value], index) => ({
      label,
      value,
      color: CLASS_COLORS[index % CLASS_COLORS.length],
    }));
  }

  buildWorklist(students: Student[]): DashboardWorklistItem[] {
    const pendingApproval = students.filter((s) => deriveStudentStatus(s) === 'pending_approval');
    const pendingDocs = students.filter((s) => deriveStudentStatus(s) === 'pending_docs');
    const newAdmission = students.filter((s) => deriveStudentStatus(s) === 'new_admission');

    return [
      {
        id: 'pending_approval',
        label: 'Pending Admission Approval',
        count: pendingApproval.length,
        studentId: pendingApproval[0]?.id,
      },
      {
        id: 'pending_docs',
        label: 'Pending Documents',
        count: pendingDocs.length,
        studentId: pendingDocs[0]?.id,
      },
      {
        id: 'new_admission',
        label: 'New Admissions',
        count: newAdmission.length,
        studentId: newAdmission[0]?.id,
      },
    ];
  }

  buildAlerts(students: Student[]): DashboardWorklistItem[] {
    const overdue = students.filter((s) => s.feeStatus === 'overdue');
    const inactive = students.filter((s) => deriveStudentStatus(s) === 'inactive');

    return [
      {
        id: 'fee_overdue',
        label: 'Fee Payment Overdue',
        count: overdue.length,
        studentId: overdue[0]?.id,
      },
      {
        id: 'inactive',
        label: 'Inactive Students',
        count: inactive.length,
        studentId: inactive[0]?.id,
      },
    ];
  }

  buildFavorites(students: Student[]): DashboardFavorite[] {
    return students.slice(0, 5).map((student) => ({
      id: String(student.id),
      studentId: student.id,
      title: `${student.name} — ${student.class || 'N/A'}`,
      date: new Date(student.createdDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }));
  }

  private async buildRecentActivity(
    students: Student[],
    activities: StudentActivity[]
  ): Promise<DashboardActivity[]> {
    const studentMap = new Map(students.map((s) => [s.id!, s]));

    return activities.map((activity) => {
      const student = studentMap.get(activity.studentId);
      return {
        id: String(activity.id),
        studentId: activity.studentId,
        studentCode: formatStudentCode(activity.studentId),
        studentName: student?.name ?? 'Unknown',
        message: activity.message,
        actionDate: activity.actionDate,
        loggedDate: activity.loggedDate,
      };
    });
  }
}
