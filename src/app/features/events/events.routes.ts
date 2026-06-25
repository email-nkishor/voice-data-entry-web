import { Routes } from '@angular/router';

export const EVENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/event-list/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/event-form/event-form.component').then((m) => m.EventFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/event-form/event-form.component').then((m) => m.EventFormComponent),
  },
];
