import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { Survey } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-entry',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './survey-entry.component.html',
})
export class SurveyEntryComponent implements OnInit {
  private readonly moduleCode = 'survey' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};

  constructor(
    private formSchemaService: FormSchemaService,
    private surveyService: SurveyService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
    this.formValues['surveyDate'] = new Date().toISOString().split('T')[0];
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
    this.formValues['surveyDate'] = new Date().toISOString().split('T')[0];
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const survey: Survey = {
      respondentName: this.formValues['respondentName'] ?? '',
      mobile: this.formValues['mobile'] ?? '',
      feedback: this.formValues['feedback'] ?? '',
      surveyDate: this.formValues['surveyDate'] ?? new Date().toISOString().split('T')[0],
    };

    await this.surveyService.add(survey);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/survey']);
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
