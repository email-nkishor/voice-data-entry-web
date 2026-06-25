import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { CertificateService } from '../../../../core/services/certificate.service';
import { CertificateRecord } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-verify',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './certificate-verify.component.html',
})
export class CertificateVerifyComponent {
  code = '';
  result: { valid: boolean; message: string; certificate?: CertificateRecord } | null = null;
  loading = false;

  constructor(private certificateService: CertificateService) {}

  async verify(): Promise<void> {
    if (!this.code.trim()) {
      return;
    }
    this.loading = true;
    this.result = null;
    try {
      this.result = await this.certificateService.verify(this.code.trim());
    } finally {
      this.loading = false;
    }
  }
}
