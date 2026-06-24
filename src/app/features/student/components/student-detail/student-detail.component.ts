import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import {
  DUMMY_RECENT_ACTIVITY,
  DUMMY_STATUS_SEGMENTS,
} from '../../../dashboard/data/student-dashboard.dummy';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ModuleActionHeaderComponent],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  studentCode = '';
  status = 'Active';
  activities: typeof DUMMY_RECENT_ACTIVITY = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentCode = `STU${String(id).padStart(7, '0')}`;

    const existing = await this.studentService.getById(id);
    if (existing) {
      this.student = existing;
      this.status = this.resolveStatus(existing);
    } else {
      this.student = this.buildDummyStudent(id);
    }

    this.activities = DUMMY_RECENT_ACTIVITY.filter(
      (item) => item.studentId === id
    );
    if (this.activities.length === 0 && this.student) {
      this.activities = [
        {
          id: 'local-1',
          studentId: id,
          studentCode: this.studentCode,
          studentName: this.student.name,
          message: `Student (${this.studentCode}) profile opened`,
          actionDate: this.formatToday(),
          loggedDate: this.formatToday(),
        },
      ];
    }
  }

  onEdit(): void {
    if (this.student?.id) {
      this.router.navigate(['/student/edit', this.student.id]);
    }
  }

  getStatusColor(): string {
    const match = DUMMY_STATUS_SEGMENTS.find((item) => item.label === this.status);
    return match?.color ?? '#22c55e';
  }

  private resolveStatus(student: Student): string {
    if (!student.mobile?.trim()) {
      return 'Pending Docs';
    }
    if (!student.class?.trim()) {
      return 'New Admission';
    }
    return 'Active';
  }

  private buildDummyStudent(id: number): Student {
    const dummy = DUMMY_RECENT_ACTIVITY.find((item) => item.studentId === id);
    return {
      id,
      name: dummy?.studentName ?? `Student ${id}`,
      class: 'MCA',
      rollNo: String(5000 + id),
      mobile: '9876543210',
      address: 'Noida',
      createdDate: new Date().toISOString(),
    };
  }

  private formatToday(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
