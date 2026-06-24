import { ListColumn } from '../../../core/models/list-column.model';

/** Columns for student search table, filter popup, and manage columns. */
export const STUDENT_LIST_COLUMNS: ListColumn[] = [
  { key: 'name', label: 'Name', visible: true, filterable: true, exportable: true, allowHide: false },
  { key: 'class', label: 'Class', visible: true, filterable: true, exportable: true, allowHide: false, filterType: 'select', lookupKey: 'class' },
  { key: 'rollNo', label: 'Roll No', visible: true, filterable: true, exportable: true, allowHide: false },
  { key: 'mobile', label: 'Mobile', visible: true, filterable: true, exportable: true, allowHide: false },
  { key: 'address', label: 'Address', visible: false, filterable: true, exportable: true, allowHide: true },
  {
    key: 'admissionNo',
    label: 'Admission No',
    visible: false,
    filterable: true,
    exportable: true,
    allowHide: true,
  },
  {
    key: 'parentName',
    label: 'Parent Name',
    visible: false,
    filterable: true,
    exportable: true,
    allowHide: true,
  },
  {
    key: 'parentMobile',
    label: 'Parent Mobile',
    visible: false,
    filterable: true,
    exportable: true,
    allowHide: true,
  },
  {
    key: 'academicYear',
    label: 'Academic Year',
    visible: false,
    filterable: true,
    exportable: true,
    allowHide: true,
  },
  { key: 'section', label: 'Grade', visible: false, filterable: true, exportable: true, allowHide: true, filterType: 'select', lookupKey: 'grade' },
  { key: 'status', label: 'Status', visible: false, filterable: true, exportable: true, allowHide: true, filterType: 'select', lookupKey: 'status' },
  { key: 'feeStatus', label: 'Fee Status', visible: false, filterable: true, exportable: true, allowHide: true, filterType: 'select', lookupKey: 'feeStatus' },
  {
    key: 'createdDate',
    label: 'Created Date',
    visible: false,
    filterable: true,
    exportable: true,
    allowHide: true,
  },
];

export function mergeStudentListColumns(saved: ListColumn[] | null): ListColumn[] {
  const base = STUDENT_LIST_COLUMNS.map((col) => ({ ...col }));
  if (!saved?.length) {
    return base;
  }

  const savedMap = new Map(saved.map((col) => [col.key, col]));
  for (const column of base) {
    const prev = savedMap.get(column.key);
    if (prev) {
      column.visible = column.allowHide === false ? true : prev.visible;
    }
  }
  return base;
}
