export type DynamicFieldType = 'text' | 'number' | 'phone' | 'multiline' | 'select';

export interface DynamicColumn {
  id?: number;
  moduleCode: string;
  columnKey: string;
  label: string;
  speechKeywords: string[];
  fieldType: DynamicFieldType;
  sortOrder: number;
  isLeadingField?: boolean;
  /** Backend lookup category for select fields (e.g. class, grade) */
  lookupKey?: string;
  /** System fields cannot be removed from column config */
  isSystemField?: boolean;
  /** When false, Remove is hidden (defaults to true for custom columns) */
  allowDelete?: boolean;
  /** When false, voice keywords / field type cannot be edited */
  allowVoiceEdit?: boolean;
}

export interface FormColumnRecord {
  id?: number;
  moduleCode: string;
  columnKey: string;
  label: string;
  speechKeywords: string;
  fieldType: string;
  sortOrder: number;
  isLeadingField: number;
  isSystemField?: number;
  allowDelete?: number;
  allowVoiceEdit?: number;
}
