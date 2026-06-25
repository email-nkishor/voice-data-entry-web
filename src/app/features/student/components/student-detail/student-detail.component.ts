import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomFieldService } from '../../../../core/services/custom-field.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CustomFieldRendererComponent } from '../../../../shared/components/custom-field-renderer/custom-field-renderer.component';
import {
  CustomFieldDefinition,
} from '../../../../core/models/custom-field.model';
import {
  deriveStudentStatus,
  formatStudentCode,
  STUDENT_STATUS_COLORS,
  STUDENT_STATUS_LABELS,
  Student,
} from '../../models/student.model';
import { VoiceEntryService } from '../../../../core/services/voice-entry.service';
import { VoiceEntryRecord } from '../../../../core/models/voice-entry.model';
import { CertificateService } from '../../../../core/services/certificate.service';
import { AwardService } from '../../../../core/services/award.service';
import {
  AwardRecord,
  CertificateRecord,
  StudentAchievementSummary,
} from '../../../../core/models/certificate.model';
import { StudentService } from '../../services/student.service';
import { StudentActivityService } from '../../services/student-activity.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, KeyValuePipe, ModuleActionHeaderComponent, ConfirmationDialogComponent, CustomFieldRendererComponent],
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
  customFieldDefinitions: CustomFieldDefinition[] = [];
  customFieldValues: Record<string, unknown> = {};
  voiceEntries: VoiceEntryRecord[] = [];
  certificates: CertificateRecord[] = [];
  awards: AwardRecord[] = [];
  achievementSummary: StudentAchievementSummary | null = null;
  activeTab: 'overview' | 'certificates' | 'awards' | 'achievements' = 'overview';
  canViewVoiceHistory = false;
  canViewCertificates = false;
  canViewAwards = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private customFieldService: CustomFieldService,
    private voiceEntryService: VoiceEntryService,
    private certificateService: CertificateService,
    private awardService: AwardService,
    private activityService: StudentActivityService,
    private authService: AuthService,
    private permissionService: PermissionService,
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
    this.canViewVoiceHistory = this.permissionService.canViewVoiceHistory();
    this.canViewCertificates = this.permissionService.canViewCertificates();
    this.canViewAwards = this.permissionService.canViewAwards();

    const existing = await this.studentService.getById(id);
    if (existing) {
      this.student = existing;
      const status = deriveStudentStatus(existing);
      this.statusLabel = STUDENT_STATUS_LABELS[status];
      this.statusColor = STUDENT_STATUS_COLORS[status];

      this.customFieldDefinitions = await this.customFieldService.listDefinitions('student');
      this.customFieldValues = await this.customFieldService.getValuesMap('student', id);

      if (this.canViewVoiceHistory) {
        this.voiceEntries = await this.voiceEntryService.getForStudent(id, 5);
      }
      if (this.canViewCertificates) {
        this.certificates = await this.certificateService.getForStudent(id, 10);
      }
      if (this.canViewAwards) {
        this.awards = await this.awardService.getForStudent(id, 10);
        try {
          this.achievementSummary = await this.awardService.getStudentSummary(id);
        } catch {
          this.achievementSummary = null;
        }
      }
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

  formatVoiceDate(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  setTab(tab: 'overview' | 'certificates' | 'awards' | 'achievements'): void {
    this.activeTab = tab;
  }
}
