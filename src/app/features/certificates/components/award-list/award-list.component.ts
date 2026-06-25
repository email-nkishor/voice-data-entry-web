import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AwardService } from '../../../../core/services/award.service';
import { AwardRecord } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-award-list',
  standalone: true,
  imports: [RouterLink, FormsModule, ModuleActionHeaderComponent],
  templateUrl: './award-list.component.html',
  styleUrl: './award-list.component.scss',
})
export class AwardListComponent implements OnInit {
  awards: AwardRecord[] = [];
  loading = true;
  categoryFilter = '';
  canCreate = false;
  canApprove = false;

  constructor(
    private awardService: AwardService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {
    this.canCreate = this.permissionService.canCreateAward();
    this.canApprove = this.permissionService.canCreateAward();
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const res = await this.awardService.list({
        category: this.categoryFilter || undefined,
        limit: 50,
      });
      this.awards = res.items;
    } catch {
      this.toast.error('Failed to load awards');
    } finally {
      this.loading = false;
    }
  }

  async approve(award: AwardRecord): Promise<void> {
    try {
      await this.awardService.approve(award.id);
      this.toast.success('Award approved');
      await this.load();
    } catch {
      this.toast.error('Failed to approve award');
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN');
  }
}
