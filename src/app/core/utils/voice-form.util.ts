import { DynamicColumn } from '../models/dynamic-column.model';

export function createEmptyFormValues(
  columns: DynamicColumn[]
): Record<string, string> {
  const formValues: Record<string, string> = {};
  for (const column of columns) {
    formValues[column.columnKey] = '';
  }
  return formValues;
}

export function applyVoiceParsedValues(
  formValues: Record<string, string>,
  parsed: Record<string, string>
): void {
  for (const [key, value] of Object.entries(parsed)) {
    if (Object.prototype.hasOwnProperty.call(formValues, key)) {
      formValues[key] = value;
    }
  }
}

export function isMultilineColumn(column: DynamicColumn): boolean {
  return column.fieldType === 'multiline';
}

export function isSelectColumn(column: DynamicColumn): boolean {
  return column.fieldType === 'select';
}

export function getColumnInputType(column: DynamicColumn): string {
  if (column.fieldType === 'phone') return 'tel';
  if (column.fieldType === 'number') return 'number';
  if (column.fieldType === 'multiline') return 'textarea';
  return 'text';
}

export function getColumnKeyboardType(column: DynamicColumn): string {
  if (column.fieldType === 'phone') return 'phone';
  if (column.fieldType === 'number') return 'number';
  return 'default';
}
