import {
  DashboardActivity,
  DashboardFavorite,
  DashboardWorklistItem,
  DonutSegment,
} from '../models/student-dashboard.model';

export const DUMMY_STATUS_SEGMENTS: DonutSegment[] = [
  { label: 'Active', value: 186, color: '#22c55e' },
  { label: 'On Leave', value: 42, color: '#facc15' },
  { label: 'Graduated', value: 98, color: '#0ea5e9' },
  { label: 'New Admission', value: 67, color: '#86efac' },
  { label: 'Pending Docs', value: 34, color: '#94a3b8' },
  { label: 'Inactive', value: 22, color: '#ef4444' },
];

export const DUMMY_CLASS_SEGMENTS: DonutSegment[] = [
  { label: 'MCA', value: 89, color: '#16a34a' },
  { label: 'BCA', value: 76, color: '#22c55e' },
  { label: 'B.Tech', value: 124, color: '#4ade80' },
  { label: 'MBA', value: 54, color: '#86efac' },
  { label: 'Class 10', value: 48, color: '#bbf7d0' },
  { label: 'Class 12', value: 58, color: '#dcfce7' },
];

export const DUMMY_RECENT_ACTIVITY: DashboardActivity[] = [
  {
    id: '1',
    studentId: 1,
    studentCode: 'STU0005051',
    studentName: 'Nand Kishor',
    message: 'Student (STU0005051) is Updated',
    actionDate: '31 Mar 2026',
    loggedDate: '31 Mar 2026',
  },
  {
    id: '2',
    studentId: 1,
    studentCode: 'STU0005051',
    studentName: 'Nand Kishor',
    message: 'Student (STU0005051) is Created',
    actionDate: '31 Mar 2026',
    loggedDate: '31 Mar 2026',
  },
  {
    id: '3',
    studentId: 2,
    studentCode: 'STU0005052',
    studentName: 'Shweta Kumari',
    message: 'Student (STU0005052) mobile updated',
    actionDate: '30 Mar 2026',
    loggedDate: '30 Mar 2026',
  },
  {
    id: '4',
    studentId: 3,
    studentCode: 'STU0005053',
    studentName: 'आनंद किशोर',
    message: 'Student (STU0005053) attendance marked Present',
    actionDate: '29 Mar 2026',
    loggedDate: '29 Mar 2026',
  },
];

export const DUMMY_WORKLIST: DashboardWorklistItem[] = [
  { id: 'w1', studentId: 4, label: 'Pending Admission Approval', count: 10 },
  { id: 'w2', label: 'Unassigned Class Students', count: 87 },
  { id: 'w3', studentId: 5, label: 'Missing Mobile Number', count: 24 },
];

export const DUMMY_ALERTS: DashboardWorklistItem[] = [
  { id: 'a1', label: 'Fee Payment Overdue', count: 96 },
  { id: 'a2', label: 'Low Attendance Warning', count: 42 },
  { id: 'a3', studentId: 2, label: 'Document Verification Pending', count: 18 },
];

export const DUMMY_FAVORITES: DashboardFavorite[] = [
  { id: 'f1', studentId: 1, title: 'Nand Kishor — MCA', date: '19 Aug 2025' },
  { id: 'f2', studentId: 2, title: 'Shweta Kumari — BCA', date: '12 Jan 2026' },
  { id: 'f3', title: 'Class 10 — Section A', date: '05 Feb 2026' },
];
