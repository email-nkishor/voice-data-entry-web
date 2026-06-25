import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { Student } from '../../../student/models/student.model';
import { StudentService } from '../../../student/services/student.service';
import { Attendance, AttendanceStatus } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-entry',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './attendance-entry.component.html',
})
export class AttendanceEntryComponent implements OnInit {
  private readonly moduleCode = 'attendance' as const;

  students: Student[] = [];
  statusOptions: AttendanceStatus[] = [];
  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};
  selectedStudentId = 0;

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private formSchemaService: FormSchemaService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.students = await this.studentService.getAll();
    this.statusOptions = this.attendanceService.getStatusOptions();
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
    this.formValues['attendanceDate'] = new Date().toISOString().split('T')[0];
    this.formValues['status'] = 'present';
    if (this.students[0]?.id) {
      this.selectedStudentId = this.students[0].id;
    }
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
    this.formValues['attendanceDate'] = new Date().toISOString().split('T')[0];
    this.formValues['status'] = 'present';
  }

  async onSave(): Promise<void> {
    if (!this.selectedStudentId) {
      this.toastService.error('Please select a student');
      return;
    }

    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const attendance: Attendance = {
      studentId: this.selectedStudentId,
      attendanceDate: this.formValues['attendanceDate'] ?? new Date().toISOString().split('T')[0],
      status: this.normalizeStatus(this.formValues['status']),
    };

    await this.attendanceService.addLocal(attendance);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/attendance']);
  }

  private normalizeStatus(value: string): AttendanceStatus {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('absent') || normalized.includes('अनुपस्थित')) {
      return 'absent';
    }
    if (normalized.includes('late') || normalized.includes('देर')) {
      return 'late';
    }
    if (normalized.includes('excused')) {
      return 'excused';
    }
    return 'present';
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
