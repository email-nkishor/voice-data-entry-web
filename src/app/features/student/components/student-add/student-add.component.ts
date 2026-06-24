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
  studentFromFormValues,
} from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-add',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './student-add.component.html',
})
export class StudentAddComponent implements OnInit {
  private readonly moduleCode = 'student' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};
  groupId?: number;

  constructor(
    private formSchemaService: FormSchemaService,
    private studentService: StudentService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const groupParam = this.route.snapshot.queryParamMap.get('groupId');
    if (groupParam) {
      const parsed = Number(groupParam);
      if (!Number.isNaN(parsed)) {
        this.groupId = parsed;
      }
    }

    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const student = studentFromFormValues(this.formValues, {
      groupId: this.groupId,
      customData: JSON.stringify(extractCustomFieldValues(this.formValues)),
    });

    await this.studentService.add(student);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/student/dashboard']);
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
    if (!this.formValues['status']) {
      this.formValues['status'] = 'new_admission';
    }
    if (!this.formValues['feeStatus']) {
      this.formValues['feeStatus'] = 'not_applicable';
    }
    if (!this.formValues['academicYear']) {
      this.formValues['academicYear'] = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    }
  }
}
