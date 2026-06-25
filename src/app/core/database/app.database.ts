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
import { StudentActivity } from '../../features/student/models/student-activity.model';
import {
  CustomFieldDefinition,
  CustomFieldValueRecord,
} from '../models/custom-field.model';
import { VoiceEntryRecord } from '../models/voice-entry.model';
import { AwardRecord, CertificateRecord, CertificateTemplate } from '../models/certificate.model';
import { DashboardOverview } from '../models/report.model';
import { EventRecord } from '../../features/events/models/event.model';

export interface ReportSnapshot {
  id: string;
  data: DashboardOverview;
  cachedAt: string;
}

export interface OrganizationSnapshot {
  id: string;
  data: import('../models/organization.model').Organization;
  cachedAt: string;
}

export interface ParentDashboardSnapshot {
  id: string;
  data: import('../models/parent-portal.model').ParentDashboardData;
  cachedAt: string;
}

export interface ParentChildProfileSnapshot {
  id: string;
  data: Record<string, unknown>;
  cachedAt: string;
}

export interface ParentChildAttendanceSnapshot {
  id: string;
  studentId: number;
  data?: import('../models/parent-portal.model').ParentAttendanceRecord[];
  summary?: import('../models/parent-portal.model').ParentAttendanceSummary;
  cachedAt: string;
}

export interface EventParticipantRecord {
  id: number;
  eventId: number;
  studentId: number;
  registrationStatus: string;
}

export interface UserStudentLinkRecord {
  id: number;
  userId: number;
  studentId: number;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

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
  studentActivities!: Table<StudentActivity, number>;
  customFieldDefinitions!: Table<CustomFieldDefinition, number>;
  customFieldValues!: Table<CustomFieldValueRecord, number>;
  voiceEntries!: Table<VoiceEntryRecord, number>;
  certificateTemplates!: Table<CertificateTemplate, number>;
  certificates!: Table<CertificateRecord, number>;
  awards!: Table<AwardRecord, number>;
  reportSnapshots!: Table<ReportSnapshot, string>;
  organizations!: Table<OrganizationSnapshot, string>;
  parentDashboardSnapshots!: Table<ParentDashboardSnapshot, string>;
  parentChildProfiles!: Table<ParentChildProfileSnapshot, string>;
  parentChildAttendanceSnapshots!: Table<ParentChildAttendanceSnapshot, string>;
  events!: Table<EventRecord, number>;
  eventParticipants!: Table<EventParticipantRecord, number>;
  userStudentLinks!: Table<UserStudentLinkRecord, number>;

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

    this.version(3).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
    });

    this.version(4).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
    });

    this.version(5).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
    });

    this.version(6).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
      certificateTemplates: 'id, certificateType, isActive',
      certificates: 'id, studentId, certificateNumber, status, issueDate, syncStatus',
      awards: 'id, studentId, category, status, awardDate, syncStatus',
    });

    this.version(7).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
      certificateTemplates: 'id, certificateType, isActive',
      certificates: 'id, studentId, certificateNumber, status, issueDate, syncStatus',
      awards: 'id, studentId, category, status, awardDate, syncStatus',
      reportSnapshots: 'id, cachedAt',
    });

    this.version(8).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
      certificateTemplates: 'id, certificateType, isActive',
      certificates: 'id, studentId, certificateNumber, status, issueDate, syncStatus',
      awards: 'id, studentId, category, status, awardDate, syncStatus',
      reportSnapshots: 'id, cachedAt',
      organizations: 'id, cachedAt',
      parentDashboardSnapshots: 'id, cachedAt',
      parentChildProfiles: 'id, cachedAt',
    });

    this.version(9).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId, syncStatus',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus, serverId',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
      certificateTemplates: 'id, certificateType, isActive',
      certificates: 'id, studentId, certificateNumber, status, issueDate, syncStatus',
      awards: 'id, studentId, category, status, awardDate, syncStatus',
      reportSnapshots: 'id, cachedAt',
      organizations: 'id, cachedAt',
      parentDashboardSnapshots: 'id, cachedAt',
      parentChildProfiles: 'id, cachedAt',
      events: 'id, startDate, status, groupId, clientId, syncStatus, serverId',
      eventParticipants: 'id, eventId, studentId',
      userStudentLinks: 'id, userId, studentId',
    });

    this.version(10).stores({
      students:
        '++id, name, rollNo, createdDate, updatedDate, syncStatus, groupId, status, serverId',
      studentGroups: '++id, name, createdDate, serverId, syncStatus',
      studentActivities: '++id, studentId, actionDate',
      attendance: '++id, studentId, attendanceDate, syncStatus, serverId',
      expenses: '++id, expenseDate, syncStatus',
      inventory: '++id, purchaseDate, syncStatus',
      surveys: '++id, surveyDate, syncStatus',
      patients: '++id, patientName, syncStatus',
      formColumns: '++id, moduleCode, columnKey, sortOrder',
      syncQueue: '++id, entity, synced, createdAt',
      customFieldDefinitions: 'id, entityType, fieldName, displayOrder, isActive',
      customFieldValues: '++id, entityType, entityId, fieldDefinitionId, fieldName, syncStatus',
      voiceEntries: 'id, studentId, moduleCode, status, createdAt, speechEngine, syncStatus',
      certificateTemplates: 'id, certificateType, isActive',
      certificates: 'id, studentId, certificateNumber, status, issueDate, syncStatus',
      awards: 'id, studentId, category, status, awardDate, syncStatus',
      reportSnapshots: 'id, cachedAt',
      organizations: 'id, cachedAt',
      parentDashboardSnapshots: 'id, cachedAt',
      parentChildProfiles: 'id, cachedAt',
      parentChildAttendanceSnapshots: 'id, studentId, cachedAt',
      events: 'id, startDate, status, groupId, clientId, syncStatus, serverId',
      eventParticipants: 'id, eventId, studentId',
      userStudentLinks: 'id, userId, studentId',
    });
  }
}

export const appDatabase = new AppDatabase();
