import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { CustomFieldDefinition } from '../../../../core/models/custom-field.model';
import { CustomFieldService } from '../../../../core/services/custom-field.service';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { CustomFieldRendererComponent } from '../../../../shared/components/custom-field-renderer/custom-field-renderer.component';
import {
  extractCustomFieldValues,
  studentFromFormValues,
} from '../../models/student.model';
import { VoiceEntryService } from '../../../../core/services/voice-entry.service';
import { VoiceSessionService } from '../../../../core/services/voice-session.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-add',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent, CustomFieldRendererComponent],
  templateUrl: './student-add.component.html',
})
export class StudentAddComponent implements OnInit {
  readonly moduleCode = 'student' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};
  customFieldDefinitions: CustomFieldDefinition[] = [];
  customFieldValues: Record<string, unknown> = {};
  customFieldErrors: Record<string, string> = {};
  groupId?: number;

  constructor(
    private formSchemaService: FormSchemaService,
    private studentService: StudentService,
    private customFieldService: CustomFieldService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private voiceEntryService: VoiceEntryService,
    private voiceSessionService: VoiceSessionService
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
    this.customFieldDefinitions = await this.customFieldService.listDefinitions('student');
    this.customFieldValues = this.customFieldService.buildDefaultValues(this.customFieldDefinitions);
    this.voiceSessionService.begin(this.moduleCode);
    this.resetForm();
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    this.customFieldErrors = this.customFieldService.validateLocal(
      this.customFieldDefinitions,
      this.customFieldValues
    );

    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }
    if (Object.keys(this.customFieldErrors).length > 0) {
      this.toastService.error('Please fix custom field errors');
      return;
    }

    const student = studentFromFormValues(this.formValues, {
      groupId: this.groupId,
      customData: JSON.stringify(extractCustomFieldValues(this.formValues)),
    });

    const id = await this.studentService.add(student);
    await this.customFieldService.saveEntityValues(
      'student',
      id,
      this.customFieldDefinitions,
      this.customFieldValues
    );

    await this.voiceEntryService.persistFromSession({
      studentId: id,
      entityType: 'student',
      entityId: id,
      formValues: this.formValues,
      status: 'saved',
    });

    this.toastService.success('Saved successfully');
    this.router.navigate(['/student/dashboard']);
  }

  onCustomFieldsChange(values: Record<string, unknown>): void {
    this.customFieldValues = values;
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
    this.customFieldValues = this.customFieldService.buildDefaultValues(this.customFieldDefinitions);
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
