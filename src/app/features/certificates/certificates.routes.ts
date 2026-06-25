import { Routes } from '@angular/router';

export const CERTIFICATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/certificate-list/certificate-list.component').then((m) => m.CertificateListComponent),
  },
  {
    path: 'issue',
    loadComponent: () =>
      import('./components/certificate-form/certificate-form.component').then((m) => m.CertificateFormComponent),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('./components/certificate-verify/certificate-verify.component').then((m) => m.CertificateVerifyComponent),
  },
  {
    path: 'awards',
    loadComponent: () =>
      import('./components/award-list/award-list.component').then((m) => m.AwardListComponent),
  },
  {
    path: 'awards/add',
    loadComponent: () =>
      import('./components/award-form/award-form.component').then((m) => m.AwardFormComponent),
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('./components/template-list/template-list.component').then((m) => m.TemplateListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/certificate-detail/certificate-detail.component').then((m) => m.CertificateDetailComponent),
  },
];
