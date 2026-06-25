import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';
import { parentPortalGuard } from '../../core/guards/parent-portal.guard';
import { parentAttendanceGuard } from '../../core/guards/parent-attendance.guard';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('parent'), parentPortalGuard],
    loadComponent: () =>
      import('./components/parent-shell/parent-shell.component').then((m) => m.ParentShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/parent-dashboard/parent-dashboard.component').then(
            (m) => m.ParentDashboardComponent
          ),
      },
      {
        path: 'child/:studentId/profile',
        loadComponent: () =>
          import('./components/child-profile/child-profile.component').then(
            (m) => m.ChildProfileComponent
          ),
      },
      {
        path: 'child/:studentId/voice',
        loadComponent: () =>
          import('./components/child-voice/child-voice.component').then((m) => m.ChildVoiceComponent),
      },
      {
        path: 'child/:studentId/certificates',
        loadComponent: () =>
          import('./components/child-certificates/child-certificates.component').then(
            (m) => m.ChildCertificatesComponent
          ),
      },
      {
        path: 'child/:studentId/awards',
        loadComponent: () =>
          import('./components/child-awards/child-awards.component').then(
            (m) => m.ChildAwardsComponent
          ),
      },
      {
        path: 'child/:studentId/events',
        loadComponent: () =>
          import('./components/child-events/child-events.component').then(
            (m) => m.ChildEventsComponent
          ),
      },
      {
        path: 'child/:studentId/attendance',
        canActivate: [parentAttendanceGuard],
        loadComponent: () =>
          import('./components/child-attendance/child-attendance.component').then(
            (m) => m.ChildAttendanceComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/parent-settings/parent-settings.component').then(
            (m) => m.ParentSettingsComponent
          ),
      },
    ],
  },
];
