import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CertificateService } from '../../../../core/services/certificate.service';
import { CertificateRecord } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [RouterLink, FormsModule, ModuleActionHeaderComponent],
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss',
})
export class CertificateListComponent implements OnInit {
  certificates: CertificateRecord[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  total = 0;
  canCreate = false;
  canManageTemplates = false;

  constructor(
    private certificateService: CertificateService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {
    this.canCreate = this.permissionService.canCreateCertificate();
    this.canManageTemplates = this.permissionService.canManageCertificateTemplates();
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const res = await this.certificateService.list({
        search: this.search || undefined,
        status: this.statusFilter || undefined,
        limit: 50,
      });
      this.certificates = res.items;
      this.total = res.total;
    } catch {
      this.toast.error('Failed to load certificates');
    } finally {
      this.loading = false;
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN');
  }
}
