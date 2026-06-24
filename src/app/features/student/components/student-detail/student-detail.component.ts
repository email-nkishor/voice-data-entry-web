import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  deriveStudentStatus,
  formatStudentCode,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUS_LABELS,
  Student,
} from '../../models/student.model';
import { StudentActivityService } from '../../services/student-activity.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ModuleActionHeaderComponent, ConfirmationDialogComponent],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  studentCode = '';
  statusLabel = '';
  statusColor = '#22c55e';
  activities: {
    id: string;
    studentId: number;
    studentCode: string;
    studentName: string;
    message: string;
    actionDate: string;
    loggedDate: string;
  }[] = [];
  showDeleteDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private activityService: StudentActivityService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  get canApprove(): boolean {
    if (!this.student || !this.authService.hasRole('admin', 'admission_clerk')) {
      return false;
    }
    const status = deriveStudentStatus(this.student);
    return status === 'pending_approval' || status === 'new_admission';
  }

  get canEdit(): boolean {
    return this.authService.hasRole('admin', 'admission_clerk');
  }

  get canDelete(): boolean {
    return this.authService.hasRole('admin', 'admission_clerk');
  }

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentCode = formatStudentCode(id);

    const existing = await this.studentService.getById(id);
    if (existing) {
      this.student = existing;
      const status = deriveStudentStatus(existing);
      this.statusLabel = STUDENT_STATUS_LABELS[status];
      this.statusColor = STUDENT_STATUS_COLORS[status];
    }

    const logs = await this.activityService.getRecent(10, id);
    this.activities = logs.map((a) => ({
      id: String(a.id),
      studentId: a.studentId,
      studentCode: formatStudentCode(a.studentId),
      studentName: this.student?.name ?? 'Unknown',
      message: a.message,
      actionDate: a.actionDate,
      loggedDate: a.loggedDate,
    }));
  }

  onEdit(): void {
    if (this.student?.id) {
      this.router.navigate(['/student/edit', this.student.id]);
    }
  }

  async onApprove(): Promise<void> {
    if (!this.student?.id) {
      return;
    }
    await this.studentService.approveAdmission(this.student.id);
    this.toastService.success('Admission approved');
    await this.ngOnInit();
  }

  onDeleteRequest(): void {
    this.showDeleteDialog = true;
  }

  async onDeleteConfirmed(): Promise<void> {
    if (!this.student?.id) {
      return;
    }
    const id = this.student.id;
    this.showDeleteDialog = false;
    await this.studentService.delete(id);
    this.toastService.success('Student deleted');
    this.router.navigate(['/student/list']);
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
  }
}
