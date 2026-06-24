import { Routes } from '@angular/router';

export const EXPENSE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/expense-list/expense-list.component').then(
        (m) => m.ExpenseListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/expense-add/expense-add.component').then(
        (m) => m.ExpenseAddComponent
      ),
  },
  {
    path: 'columns',
    loadComponent: () =>
      import('../../shared/components/column-config/column-config.component').then(
        (m) => m.ColumnConfigComponent
      ),
    data: { moduleCode: 'expense', title: 'Expense' },
  },
];
