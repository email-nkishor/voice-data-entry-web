import { Routes } from '@angular/router';

export const SURVEY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/survey-list/survey-list.component').then(
        (m) => m.SurveyListComponent
      ),
  },
  {
    path: 'entry',
    loadComponent: () =>
      import('./components/survey-entry/survey-entry.component').then(
        (m) => m.SurveyEntryComponent
      ),
  },
  {
    path: 'columns',
    loadComponent: () =>
      import('../../shared/components/column-config/column-config.component').then(
        (m) => m.ColumnConfigComponent
      ),
    data: { moduleCode: 'survey', title: 'Survey' },
  },
];
