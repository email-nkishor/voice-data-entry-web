import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/attendance-list/attendance-list.component').then(
        (m) => m.AttendanceListComponent
      ),
  },
  {
    path: 'daily',
    loadComponent: () =>
      import('./components/attendance-daily/attendance-daily.component').then(
        (m) => m.AttendanceDailyComponent
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/attendance-reports/attendance-reports.component').then(
        (m) => m.AttendanceReportsComponent
      ),
  },
  {
    path: 'entry',
    loadComponent: () =>
      import('./components/attendance-entry/attendance-entry.component').then(
        (m) => m.AttendanceEntryComponent
      ),
  },
  {
    path: 'columns',
    loadComponent: () =>
      import('../../shared/components/column-config/column-config.component').then(
        (m) => m.ColumnConfigComponent
      ),
    data: { moduleCode: 'attendance', title: 'Attendance' },
  },
];
