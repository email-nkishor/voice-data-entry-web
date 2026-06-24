export type StudentStatus =
  | 'pending_approval'
  | 'active'
  | 'on_leave'
  | 'graduated'
  | 'inactive'
  | 'pending_docs'
  | 'new_admission';

export type FeeStatus = 'paid' | 'partial' | 'overdue' | 'not_applicable';

export interface Student {
  id?: number;
  name: string;
  class: string;
  rollNo: string;
  mobile: string;
  address: string;
  admissionNo?: string;
  parentName?: string;
  parentMobile?: string;
  academicYear?: string;
  section?: string;
  status?: StudentStatus;
  feeStatus?: FeeStatus;
  createdDate: string;
  updatedDate?: string;
  groupId?: number;
  customData?: string;
  syncStatus?: 'pending' | 'synced';
  serverId?: number;
}

export const STUDENT_CORE_FIELD_KEYS = [
  'name',
  'class',
  'rollNo',
  'mobile',
  'address',
  'admissionNo',
  'parentName',
  'parentMobile',
  'academicYear',
  'section',
  'status',
  'feeStatus',
] as const;

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  pending_approval: 'Pending Approval',
  active: 'Active',
  on_leave: 'On Leave',
  graduated: 'Graduated',
  inactive: 'Inactive',
  pending_docs: 'Pending Docs',
  new_admission: 'New Admission',
};

export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  pending_approval: '#facc15',
  active: '#22c55e',
  on_leave: '#facc15',
  graduated: '#0ea5e9',
  inactive: '#ef4444',
  pending_docs: '#94a3b8',
  new_admission: '#86efac',
};

export function formatStudentCode(id: number): string {
  return `STU${String(id).padStart(7, '0')}`;
}

export function deriveStudentStatus(student: Student): StudentStatus {
  if (student.status) {
    return student.status;
  }
  if (!student.mobile?.trim()) {
    return 'pending_docs';
  }
  if (!student.class?.trim()) {
    return 'new_admission';
  }
  return 'active';
}

export function studentFromFormValues(
  formValues: Record<string, string>,
  base: Partial<Student> = {}
): Student {
  return {
    name: formValues['name'] ?? '',
    class: formValues['class'] ?? '',
    rollNo: formValues['rollNo'] ?? '',
    mobile: formValues['mobile'] ?? '',
    address: formValues['address'] ?? '',
    admissionNo: formValues['admissionNo'] ?? '',
    parentName: formValues['parentName'] ?? '',
    parentMobile: formValues['parentMobile'] ?? '',
    academicYear: formValues['academicYear'] ?? '',
    section: formValues['section'] ?? '',
    status: (formValues['status'] as StudentStatus) || 'new_admission',
    feeStatus: (formValues['feeStatus'] as FeeStatus) || 'not_applicable',
    createdDate: base.createdDate ?? new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    groupId: base.groupId,
    customData: base.customData,
    id: base.id,
    serverId: base.serverId,
    syncStatus: base.syncStatus,
  };
}

export function studentToFormValues(
  student: Student,
  columns: { columnKey: string }[],
  customValues: Record<string, string> = {}
): Record<string, string> {
  const values: Record<string, string> = {};
  const record = student as unknown as Record<string, string>;
  for (const column of columns) {
    const key = column.columnKey;
    if ((STUDENT_CORE_FIELD_KEYS as readonly string[]).includes(key)) {
      values[key] = String(record[key] ?? '');
    } else {
      values[key] = customValues[key] ?? '';
    }
  }
  return values;
}

export function extractCustomFieldValues(
  formValues: Record<string, string>
): Record<string, string> {
  const custom: Record<string, string> = {};
  for (const [key, value] of Object.entries(formValues)) {
    if (!(STUDENT_CORE_FIELD_KEYS as readonly string[]).includes(key)) {
      custom[key] = value;
    }
  }
  return custom;
}

export function parseCustomData(customData?: string): Record<string, string> {
  if (!customData) {
    return {};
  }
  try {
    return JSON.parse(customData) as Record<string, string>;
  } catch {
    return {};
  }
}
