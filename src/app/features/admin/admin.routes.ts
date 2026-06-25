import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'custom-fields',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./components/custom-field-list/custom-field-list.component').then(
        (m) => m.CustomFieldListComponent
      ),
  },
  {
    path: 'organization',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./components/organization-settings/organization-settings.component').then(
        (m) => m.OrganizationSettingsComponent
      ),
  },
];
