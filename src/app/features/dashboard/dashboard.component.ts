import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModuleActionHeaderComponent } from '../../shared/components/module-action-header/module-action-header.component';
import { SpeechEngineSelectorComponent } from '../../shared/components/speech-engine-selector/speech-engine-selector.component';
import { SyncBarComponent } from '../../shared/components/sync-bar/sync-bar.component';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { OrganizationService } from '../../core/services/organization.service';
import { ReportService } from '../../core/services/report.service';
import { DashboardOverview } from '../../core/models/report.model';
import { DashboardNavItem } from './models/dashboard-nav.model';
import { getNavItemsForRole, groupNavItemsBySection } from './dashboard-nav.util';
import { DashboardNavSection } from './models/dashboard-nav.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent, SpeechEngineSelectorComponent, SyncBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  navItems: DashboardNavItem[] = [];
  navSections: Record<DashboardNavSection, DashboardNavItem[]> = {
    voice: [],
    school: [],
    admin: [],
  };
  userName = '';
  userRole = '';
  overview: DashboardOverview | null = null;
  canViewReports = false;
  parentPortalDisabled = false;
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private reportService: ReportService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    void this.updateNav();
    this.sub = this.authService.user$.subscribe(() => void this.updateNav());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async updateNav(): Promise<void> {
    const user = this.authService.currentUser;
    this.userName = user?.name ?? '';
    this.userRole = user?.role ?? '';

    let parentPortalEnabled = false;
    try {
      const org = this.organizationService.current ?? (await this.organizationService.loadCurrent());
      parentPortalEnabled = org.parentPortalEnabled;
    } catch {
      parentPortalEnabled = false;
    }

    this.parentPortalDisabled = user?.role === 'parent' && !parentPortalEnabled;
    this.navItems = getNavItemsForRole(this.userRole || 'admin', { parentPortalEnabled });
    this.navSections = groupNavItemsBySection(this.navItems);

    this.canViewReports = this.permissionService.canViewReports();
    if (this.canViewReports && !this.parentPortalDisabled) {
      void this.reportService.getOverview().then((data) => {
        this.overview = data;
      });
    } else {
      this.overview = null;
    }
  }
}
