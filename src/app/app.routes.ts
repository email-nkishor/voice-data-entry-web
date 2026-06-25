import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'student',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/events/events.routes').then((m) => m.EVENT_ROUTES),
  },
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/attendance/attendance.routes').then((m) => m.ATTENDANCE_ROUTES),
  },
  {
    path: 'voice-history',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/voice-history/voice-history.routes').then((m) => m.VOICE_HISTORY_ROUTES),
  },
  {
    path: 'certificates',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/certificates/certificates.routes').then((m) => m.CERTIFICATE_ROUTES),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.REPORT_ROUTES),
  },
  {
    path: 'parent',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/parent/parent.routes').then((m) => m.PARENT_ROUTES),
  },
  {
    path: 'expense',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/expense/expense.routes').then((m) => m.EXPENSE_ROUTES),
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
  },
  {
    path: 'survey',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/survey/survey.routes').then((m) => m.SURVEY_ROUTES),
  },
  {
    path: 'patient',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
  },
];
