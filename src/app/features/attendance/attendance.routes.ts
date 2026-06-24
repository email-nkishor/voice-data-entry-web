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
