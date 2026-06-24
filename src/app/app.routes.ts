import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
  },
  {
    path: 'attendance',
    loadChildren: () =>
      import('./features/attendance/attendance.routes').then(
        (m) => m.ATTENDANCE_ROUTES
      ),
  },
  {
    path: 'expense',
    loadChildren: () =>
      import('./features/expense/expense.routes').then((m) => m.EXPENSE_ROUTES),
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('./features/inventory/inventory.routes').then(
        (m) => m.INVENTORY_ROUTES
      ),
  },
  {
    path: 'survey',
    loadChildren: () =>
      import('./features/survey/survey.routes').then((m) => m.SURVEY_ROUTES),
  },
  {
    path: 'patient',
    loadChildren: () =>
      import('./features/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
  },
];
