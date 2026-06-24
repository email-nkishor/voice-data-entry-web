import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import {
  extractCustomFieldValues,
  parseCustomData,
  studentFromFormValues,
  studentToFormValues,
} from '../../models/student.model';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

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
  serverId?: number;

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
      this.serverId = existing.serverId;
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

    const student = studentFromFormValues(this.formValues, {
      id: this.studentId,
      createdDate: this.createdDate,
      groupId: this.groupId,
      serverId: this.serverId,
      customData: JSON.stringify(extractCustomFieldValues(this.formValues)),
    });

    await this.studentService.update(student);
    this.toastService.success('Updated successfully');
    this.router.navigate(['/student/view', this.studentId]);
  }

  private populateForm(student: Student): void {
    const customValues = parseCustomData(student.customData);
    this.formValues = studentToFormValues(student, this.columns, customValues);
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
