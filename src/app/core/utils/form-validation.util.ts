import { ModuleCode } from '../config/module-column-defaults';

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  message: string;
}

const MODULE_REQUIRED_FIELDS: Record<ModuleCode, { key: string; label: string }[]> = {
  student: [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
  ],
  patient: [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'mobile', label: 'Mobile' },
  ],
  survey: [
    { key: 'respondentName', label: 'Respondent Name' },
    { key: 'mobile', label: 'Mobile' },
  ],
  expense: [{ key: 'expenseName', label: 'Expense Name' }],
  inventory: [{ key: 'itemName', label: 'Item Name' }],
  attendance: [{ key: 'status', label: 'Status' }],
};

const MOBILE_KEYS = new Set(['mobile']);

function isBlank(value: string | undefined): boolean {
  return !value || !value.trim();
}

function isValidMobile(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10;
}

export function validateModuleForm(
  moduleCode: ModuleCode,
  formValues: Record<string, string>
): FormValidationResult {
  const requiredFields = MODULE_REQUIRED_FIELDS[moduleCode] ?? [];
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = formValues[field.key] ?? '';
    if (isBlank(value)) {
      errors[field.key] = `${field.label} is required`;
      continue;
    }

    if (MOBILE_KEYS.has(field.key) && !isValidMobile(value)) {
      errors[field.key] = `${field.label} must be at least 10 digits`;
    }
  }

  const firstError = Object.values(errors)[0] ?? '';
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    message: firstError,
  };
}
