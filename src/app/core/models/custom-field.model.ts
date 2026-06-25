export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'multiselect'
  | 'boolean';

export interface CustomFieldOption {
  value: string;
  label: string;
}

export interface CustomFieldValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  options?: CustomFieldOption[];
}

export interface CustomFieldDefinition {
  id: number;
  organizationId: number;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  defaultValue: string | null;
  validationRules: CustomFieldValidationRules;
  displayOrder: number;
  isActive: boolean;
  clientId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValueRecord {
  id?: number;
  fieldDefinitionId: number;
  fieldName?: string;
  entityType: string;
  entityId: number;
  value: unknown;
  rawValue?: string | null;
  clientId?: number | null;
  updatedAt?: string;
  syncStatus?: 'pending' | 'synced';
}

export interface CustomFieldDefinitionInput {
  entityType?: string;
  fieldName?: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  isRequired?: boolean;
  defaultValue?: string;
  validationRules?: CustomFieldValidationRules;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CustomFieldValueInput {
  fieldDefinitionId?: number;
  fieldName?: string;
  value: string | string[] | boolean | number | null;
}

export const CUSTOM_FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'boolean', label: 'Boolean (Yes/No)' },
];

export function formatCustomFieldDisplay(
  definition: CustomFieldDefinition,
  value: unknown
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (definition.fieldType === 'boolean') {
    return value === true || value === 'true' ? 'Yes' : 'No';
  }
  if (definition.fieldType === 'multiselect') {
    const arr = Array.isArray(value) ? value : String(value).split(',');
    const options = definition.validationRules.options ?? [];
    return arr
      .map((v) => options.find((o) => o.value === v)?.label ?? v)
      .join(', ');
  }
  if (definition.fieldType === 'dropdown') {
    const options = definition.validationRules.options ?? [];
    return options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}
