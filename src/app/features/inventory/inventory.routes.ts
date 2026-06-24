import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inventory-list/inventory-list.component').then(
        (m) => m.InventoryListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/inventory-add/inventory-add.component').then(
        (m) => m.InventoryAddComponent
      ),
  },
  {
    path: 'columns',
    loadComponent: () =>
      import('../../shared/components/column-config/column-config.component').then(
        (m) => m.ColumnConfigComponent
      ),
    data: { moduleCode: 'inventory', title: 'Inventory' },
  },
];
