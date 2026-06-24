import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../shared/components/module-action-header/module-action-header.component';
import {
  DASHBOARD_NAV_ITEMS,
  DashboardNavItem,
} from './models/dashboard-nav.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  navItems: DashboardNavItem[] = DASHBOARD_NAV_ITEMS;
}
