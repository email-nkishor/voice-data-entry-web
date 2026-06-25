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
  parseCustomData,
  studentFromFormValues,
  studentToFormValues,
} from '../../models/student.model';
import { Student } from '../../models/student.model';
import { VoiceEntryService } from '../../../../core/services/voice-entry.service';
import { VoiceSessionService } from '../../../../core/services/voice-session.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent, CustomFieldRendererComponent],
  templateUrl: './student-edit.component.html',
})
export class StudentEditComponent implements OnInit {
  readonly moduleCode = 'student' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};
  customFieldDefinitions: CustomFieldDefinition[] = [];
  customFieldValues: Record<string, unknown> = {};
  customFieldErrors: Record<string, string> = {};
  studentId?: number;
  createdDate = '';
  groupId?: number;
  serverId?: number;

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

  get backLink(): string {
    return this.studentId ? `/student/view/${this.studentId}` : '/student/list';
  }

  get pageTitle(): string {
    return this.studentId ? `Edit Student — STU${String(this.studentId).padStart(7, '0')}` : 'Edit Student';
  }

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.customFieldDefinitions = await this.customFieldService.listDefinitions('student');

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.voiceSessionService.begin(this.moduleCode);
    const existing = await this.studentService.getById(id);
    if (existing) {
      this.studentId = existing.id;
      this.createdDate = existing.createdDate;
      this.groupId = existing.groupId;
      this.serverId = existing.serverId;
      await this.populateForm(existing);
    } else {
      this.resetForm();
    }
  }

  onReset(): void {
    this.validationErrors = {};
    this.customFieldErrors = {};
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
      id: this.studentId,
      createdDate: this.createdDate,
      groupId: this.groupId,
      serverId: this.serverId,
      customData: JSON.stringify(extractCustomFieldValues(this.formValues)),
    });

    await this.studentService.update(student);
    await this.customFieldService.saveEntityValues(
      'student',
      this.studentId,
      this.customFieldDefinitions,
      this.customFieldValues,
      this.serverId
    );

    await this.voiceEntryService.persistFromSession({
      studentId: this.studentId,
      entityType: 'student',
      entityId: this.studentId,
      formValues: this.formValues,
      status: 'saved',
    });

    this.toastService.success('Updated successfully');
    this.router.navigate(['/student/view', this.studentId]);
  }

  onCustomFieldsChange(values: Record<string, unknown>): void {
    this.customFieldValues = values;
  }

  private async populateForm(student: Student): Promise<void> {
    const customValues = parseCustomData(student.customData);
    this.formValues = studentToFormValues(student, this.columns, customValues);

    const eavValues = await this.customFieldService.getValuesMap('student', student.id!);
    this.customFieldValues = this.customFieldService.mergeValues(
      this.customFieldDefinitions,
      { ...customValues, ...eavValues }
    );
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
    this.customFieldValues = this.customFieldService.buildDefaultValues(this.customFieldDefinitions);
  }
}
