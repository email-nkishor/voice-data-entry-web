import Dexie, { Table } from 'dexie';
import { FormColumnRecord } from '../models/dynamic-column.model';
import { SyncQueueItem } from '../models/sync-queue.model';
import { Student } from '../../features/student/models/student.model';
import { StudentGroup } from '../../features/student/models/student-group.model';
import { Attendance } from '../../features/attendance/models/attendance.model';
import { Expense } from '../../features/expense/models/expense.model';
import { InventoryItem } from '../../features/inventory/models/inventory.model';
import { Survey } from '../../features/survey/models/survey.model';
import { Patient } from '../../features/patient/models/patient.model';

export class AppDatabase extends Dexie {
  students!: Table<Student, number>;
  studentGroups!: Table<StudentGroup, number>;
  attendance!: Table<Attendance, number>;
  expenses!: Table<Expense, number>;
  inventory!: Table<InventoryItem, number>;
  surveys!: Table<Survey, number>;
  patients!: Table<Patient, number>;
  formColumns!: Table<FormColumnRecord, number>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('VoiceDataEntryDB');

    this.version(1).stores({
      students: '++id, name, rollNo, createdDate, syncStatus',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
    });

    this.version(2).stores({
      students: '++id, name, rollNo, createdDate, syncStatus, groupId',
      studentGroups: '++id, name, createdDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
    });
  }
}

export const appDatabase = new AppDatabase();
