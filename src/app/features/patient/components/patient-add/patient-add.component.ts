import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicColumn } from '../../../../core/models/dynamic-column.model';
import { FormSchemaService } from '../../../../core/services/form-schema.service';
import { ToastService } from '../../../../core/services/toast.service';
import { validateModuleForm } from '../../../../core/utils/form-validation.util';
import { createEmptyFormValues } from '../../../../core/utils/voice-form.util';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { VoiceDynamicFormComponent } from '../../../../shared/components/voice-dynamic-form/voice-dynamic-form.component';
import { Patient, PatientGender } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-add',
  standalone: true,
  imports: [ModuleActionHeaderComponent, VoiceDynamicFormComponent],
  templateUrl: './patient-add.component.html',
})
export class PatientAddComponent implements OnInit {
  private readonly moduleCode = 'patient' as const;

  columns: DynamicColumn[] = [];
  formValues: Record<string, string> = {};
  validationErrors: Record<string, string> = {};

  constructor(
    private formSchemaService: FormSchemaService,
    private patientService: PatientService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.columns = await this.formSchemaService.getColumns(this.moduleCode);
    this.resetForm();
    this.formValues['gender'] = 'Male';
  }

  onReset(): void {
    this.validationErrors = {};
    this.resetForm();
    this.formValues['gender'] = 'Male';
  }

  async onSave(): Promise<void> {
    const validation = validateModuleForm(this.moduleCode, this.formValues);
    this.validationErrors = validation.errors;
    if (!validation.valid) {
      this.toastService.error(validation.message);
      return;
    }

    const patient: Patient = {
      patientName: this.formValues['patientName'] ?? '',
      age: Number(this.formValues['age'] ?? 0),
      gender: this.normalizeGender(this.formValues['gender']),
      mobile: this.formValues['mobile'] ?? '',
      address: this.formValues['address'] ?? '',
    };

    await this.patientService.add(patient);
    this.toastService.success('Saved successfully');
    this.router.navigate(['/patient']);
  }

  private normalizeGender(value: string): PatientGender {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('female') || normalized.includes('महिला')) {
      return 'Female';
    }
    if (normalized.includes('other')) {
      return 'Other';
    }
    return 'Male';
  }

  private resetForm(): void {
    this.formValues = createEmptyFormValues(this.columns);
  }
}
