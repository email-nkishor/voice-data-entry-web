import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { CertificateService } from '../../../../core/services/certificate.service';
import { CertificateRecord } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [ModuleActionHeaderComponent],
  templateUrl: './certificate-detail.component.html',
  styleUrl: './certificate-detail.component.scss',
})
export class CertificateDetailComponent implements OnInit {
  cert: CertificateRecord | null = null;
  canRevoke = false;

  constructor(
    private route: ActivatedRoute,
    private certificateService: CertificateService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {
    this.canRevoke = this.permissionService.canRevokeCertificate();
  }

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cert = (await this.certificateService.getById(id)) ?? null;
    if (!this.cert) {
      this.toast.error('Certificate not found');
    }
  }

  async revoke(): Promise<void> {
    if (!this.cert) {
      return;
    }
    const reason = prompt('Revocation reason:') ?? '';
    if (!reason.trim()) {
      return;
    }
    try {
      this.cert = await this.certificateService.revoke(this.cert.id, reason);
      this.toast.success('Certificate revoked');
    } catch {
      this.toast.error('Failed to revoke certificate');
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('en-IN');
  }
}
