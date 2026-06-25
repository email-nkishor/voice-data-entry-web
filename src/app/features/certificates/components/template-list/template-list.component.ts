import { Component, OnInit } from '@angular/core';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { CertificateService } from '../../../../core/services/certificate.service';
import { CertificateTemplate } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [ModuleActionHeaderComponent],
  templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit {
  templates: CertificateTemplate[] = [];
  loading = true;

  constructor(
    private certificateService: CertificateService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      this.templates = await this.certificateService.listTemplates(true);
    } catch {
      this.toast.error('Failed to load templates');
    } finally {
      this.loading = false;
    }
  }
}
