import { DynamicColumn } from '../models/dynamic-column.model';

export type ModuleCode =
  | 'student'
  | 'attendance'
  | 'expense'
  | 'inventory'
  | 'survey'
  | 'patient';

export const MODULE_COLUMN_DEFAULTS: Record<
  ModuleCode,
  Omit<DynamicColumn, 'id' | 'moduleCode'>[]
> = {
  student: [
    {
      columnKey: 'name',
      label: 'Name',
      speechKeywords: ['name', 'नाम'],
      fieldType: 'text',
      sortOrder: 0,
      isLeadingField: true,
      isSystemField: true,
      allowDelete: false,
      allowVoiceEdit: true,
    },
    {
      columnKey: 'class',
      label: 'Class',
      speechKeywords: ['class', 'standard', 'क्लास', 'कक्षा', 'इयत्ता'],
      fieldType: 'text',
      sortOrder: 1,
      isSystemField: true,
      allowDelete: false,
      allowVoiceEdit: true,
    },
    {
      columnKey: 'rollNo',
      label: 'Roll Number',
      speechKeywords: ['roll number', 'roll no', 'roll', 'रोल नंबर', 'रोल'],
      fieldType: 'text',
      sortOrder: 2,
      isSystemField: true,
      allowDelete: false,
      allowVoiceEdit: true,
    },
    {
      columnKey: 'mobile',
      label: 'Mobile',
      speechKeywords: ['mobile', 'phone', 'contact', 'मोबाइल', 'फोन'],
      fieldType: 'phone',
      sortOrder: 3,
      isSystemField: true,
      allowDelete: false,
      allowVoiceEdit: true,
    },
    {
      columnKey: 'address',
      label: 'Address',
      speechKeywords: ['address', 'addr', 'पता', 'ऐड्रेस'],
      fieldType: 'multiline',
      sortOrder: 4,
      isSystemField: true,
      allowDelete: false,
      allowVoiceEdit: true,
    },
  ],
  attendance: [
    {
      columnKey: 'attendanceDate',
      label: 'Date',
      speechKeywords: ['date', 'attendance date', 'तारीख', 'दिनांक'],
      fieldType: 'text',
      sortOrder: 0,
    },
    {
      columnKey: 'status',
      label: 'Status',
      speechKeywords: ['status', 'present', 'absent', 'स्थिति', 'उपस्थित', 'अनुपस्थित'],
      fieldType: 'text',
      sortOrder: 1,
    },
  ],
  expense: [
    {
      columnKey: 'expenseName',
      label: 'Expense Name',
      speechKeywords: ['expense', 'expense name', 'खर्च', 'खर्च का नाम'],
      fieldType: 'text',
      sortOrder: 0,
      isLeadingField: true,
    },
    {
      columnKey: 'amount',
      label: 'Amount',
      speechKeywords: ['amount', 'rupees', 'राशि', 'रुपये'],
      fieldType: 'number',
      sortOrder: 1,
    },
    {
      columnKey: 'expenseDate',
      label: 'Date',
      speechKeywords: ['date', 'expense date', 'तारीख'],
      fieldType: 'text',
      sortOrder: 2,
    },
    {
      columnKey: 'remarks',
      label: 'Remarks',
      speechKeywords: ['remarks', 'note', 'टिप्पणी'],
      fieldType: 'multiline',
      sortOrder: 3,
    },
  ],
  inventory: [
    {
      columnKey: 'itemName',
      label: 'Item Name',
      speechKeywords: ['item', 'item name', 'सामान', 'वस्तु'],
      fieldType: 'text',
      sortOrder: 0,
      isLeadingField: true,
    },
    {
      columnKey: 'quantity',
      label: 'Quantity',
      speechKeywords: ['quantity', 'qty', 'मात्रा'],
      fieldType: 'number',
      sortOrder: 1,
    },
    {
      columnKey: 'purchaseDate',
      label: 'Purchase Date',
      speechKeywords: ['purchase date', 'date', 'खरीद तारीख'],
      fieldType: 'text',
      sortOrder: 2,
    },
  ],
  survey: [
    {
      columnKey: 'respondentName',
      label: 'Respondent Name',
      speechKeywords: ['name', 'respondent', 'नाम', 'उत्तरदाता'],
      fieldType: 'text',
      sortOrder: 0,
      isLeadingField: true,
    },
    {
      columnKey: 'mobile',
      label: 'Mobile',
      speechKeywords: ['mobile', 'phone', 'मोबाइल', 'फोन'],
      fieldType: 'phone',
      sortOrder: 1,
    },
    {
      columnKey: 'feedback',
      label: 'Feedback',
      speechKeywords: ['feedback', 'comment', 'प्रतिक्रिया'],
      fieldType: 'multiline',
      sortOrder: 2,
    },
    {
      columnKey: 'surveyDate',
      label: 'Survey Date',
      speechKeywords: ['survey date', 'date', 'तारीख'],
      fieldType: 'text',
      sortOrder: 3,
    },
  ],
  patient: [
    {
      columnKey: 'patientName',
      label: 'Patient Name',
      speechKeywords: ['patient', 'patient name', 'name', 'नाम', 'मरीज'],
      fieldType: 'text',
      sortOrder: 0,
      isLeadingField: true,
    },
    {
      columnKey: 'age',
      label: 'Age',
      speechKeywords: ['age', 'उम्र', 'आयु'],
      fieldType: 'number',
      sortOrder: 1,
    },
    {
      columnKey: 'gender',
      label: 'Gender',
      speechKeywords: ['gender', 'male', 'female', 'लिंग', 'पुरुष', 'महिला'],
      fieldType: 'text',
      sortOrder: 2,
    },
    {
      columnKey: 'mobile',
      label: 'Mobile',
      speechKeywords: ['mobile', 'phone', 'मोबाइल', 'फोन'],
      fieldType: 'phone',
      sortOrder: 3,
    },
    {
      columnKey: 'address',
      label: 'Address',
      speechKeywords: ['address', 'पता', 'ऐड्रेस'],
      fieldType: 'multiline',
      sortOrder: 4,
    },
  ],
};
