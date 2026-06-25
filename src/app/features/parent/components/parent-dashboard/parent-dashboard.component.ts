import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';
import { ParentDashboardData } from '../../../../core/models/parent-portal.model';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.scss',
})
export class ParentDashboardComponent implements OnInit {
  dashboard: ParentDashboardData | null = null;
  loading = true;

  constructor(private parentPortal: ParentPortalService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.dashboard = await this.parentPortal.getDashboard();
    } finally {
      this.loading = false;
    }
  }

  async onChildChange(studentId: number): Promise<void> {
    this.loading = true;
    try {
      this.dashboard = await this.parentPortal.getDashboard(studentId);
    } finally {
      this.loading = false;
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
