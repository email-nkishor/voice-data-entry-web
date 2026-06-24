import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

const KNOWN_STUDENT_KEYS = ['name', 'class', 'rollNo', 'mobile', 'address'];

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './student-edit.component.html',
})
export class StudentEditComponent implements OnInit {
  private readonly moduleCode = 'student' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};
  studentId?: number;
  createdDate = '';
  groupId?: number;

  constructor(
    private formSchemaService: FormSchemaService,
    private studentService: StudentService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get backLink(): string {
    return this.studentId ? `/student/view/${this.studentId}` : '/student/list';
  }

  get pageTitle(): string {
    return this.studentId ? `Edit Student — STU${String(this.studentId).padStart(7, '0')}` : 'Edit Student';
  }

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const existing = await this.studentService.getById(id);
    if (existing) {
      this.studentId = existing.id;
      this.createdDate = existing.createdDate;
      this.groupId = existing.groupId;
      this.populateForm(existing);
    } else {
      this.resetForm();
    }
  }

  onReset(): void {
    this.validationErrors = {};
    if (this.studentId) {
      this.studentService.getById(this.studentId).then((existing) => {
        if (existing) {
          this.populateForm(existing);
        }
      });
      return;
    }
    this.resetForm();
  }

  async onSave(): Promise<void> {
    if (!this.studentId) {
      return;
    }

    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const student: Student = {
      id: this.studentId,
      name: this.formValues['name'] ?? '',
      class: this.formValues['class'] ?? '',
      rollNo: this.formValues['rollNo'] ?? '',
      mobile: this.formValues['mobile'] ?? '',
      address: this.formValues['address'] ?? '',
      createdDate: this.createdDate,
      groupId: this.groupId,
      customData: JSON.stringify(this.getCustomFieldValues()),
    };

    await this.studentService.update(student);
    this.toastService.success('Updated successfully');
    this.router.navigate(['/student/view', this.studentId]);
  }

  private populateForm(student: Student): void {
    const customValues = this.parseCustomData(student.customData);
    this.formValues = createEmptyFormValues(this.columns);
    for (const column of this.columns) {
      const key = column.columnKey;
      if (KNOWN_STUDENT_KEYS.includes(key)) {
        this.formValues[key] =
          String((student as unknown as Record<string, string>)[key] ?? '');
      } else {
        this.formValues[key] = customValues[key] ?? '';
      }
    }
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }

  private getCustomFieldValues(): Record<string, string> {
    const customValues: Record<string, string> = {};
    for (const column of this.columns) {
      if (!KNOWN_STUDENT_KEYS.includes(column.columnKey)) {
        customValues[column.columnKey] = this.formValues[column.columnKey] ?? '';
      }
    }
    return customValues;
  }

  private parseCustomData(customData?: string): Record<string, string> {
    if (!customData) {
      return {};
    }
    try {
      return JSON.parse(customData) as Record<string, string>;
    } catch {
      return {};
    }
  }
}
