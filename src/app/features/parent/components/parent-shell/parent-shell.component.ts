import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ParentChildSummary } from '../../../../core/models/parent-portal.model';

@Component({
  selector: 'app-parent-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './parent-shell.component.html',
  styleUrl: './parent-shell.component.scss',
})
export class ParentShellComponent {
  children: ParentChildSummary[] = [];
  selectedStudentId: number | null = null;
  attendanceEnabled = false;

  constructor(
    private parentPortal: ParentPortalService,
    private orgService: OrganizationService,
    private authService: AuthService
  ) {
    void this.loadChildren();
    void this.loadOrgSettings();
  }

  async loadOrgSettings(): Promise<void> {
    try {
      if (!this.orgService.current) {
        await this.orgService.loadCurrent();
      }
      this.attendanceEnabled = this.orgService.isParentAttendanceEnabled();
    } catch {
      this.attendanceEnabled = false;
    }
  }

  async loadChildren(): Promise<void> {
    try {
      const dashboard = await this.parentPortal.getDashboard();
      this.children = dashboard.children;
      this.selectedStudentId = dashboard.selectedStudentId;
    } catch {
      this.children = [];
    }
  }

  childBase(studentId: number): string {
    return `/parent/child/${studentId}`;
  }

  logout(): void {
    this.authService.logout();
  }
}
