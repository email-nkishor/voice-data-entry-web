import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent
      ),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/student-list/student-list.component').then(
        (m) => m.StudentListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/student-add/student-add.component').then(
        (m) => m.StudentAddComponent
      ),
  },
  {
    path: 'columns',
    loadComponent: () =>
      import('../../shared/components/column-config/column-config.component').then(
        (m) => m.ColumnConfigComponent
      ),
    data: { moduleCode: 'student', title: 'Student' },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/student-edit/student-edit.component').then(
        (m) => m.StudentEditComponent
      ),
  },
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./components/student-detail/student-detail.component').then(
        (m) => m.StudentDetailComponent
      ),
  },
];
