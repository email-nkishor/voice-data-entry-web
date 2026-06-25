import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { CertificateService } from '../../../../core/services/certificate.service';
import { StudentService } from '../../../student/services/student.service';
import { Student } from '../../../student/models/student.model';
import {
  CERTIFICATE_TYPES,
  CertificateTemplate,
  CertificateType,
} from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-form',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './certificate-form.component.html',
})
export class CertificateFormComponent implements OnInit {
  students: Student[] = [];
  templates: CertificateTemplate[] = [];
  types = CERTIFICATE_TYPES;

  studentId = 0;
  templateId: number | null = null;
  certificateType: CertificateType = 'achievement';
  title = '';
  description = '';
  issueDate = new Date().toISOString().slice(0, 10);
  issuedBy = '';
  attachmentUrl = '';
  saving = false;

  constructor(
    private certificateService: CertificateService,
    private studentService: StudentService,
    private toast: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.students = await this.studentService.getAll();
    try {
      this.templates = await this.certificateService.listTemplates();
    } catch {
      this.templates = [];
    }
  }

  onTemplateChange(): void {
    const template = this.templates.find((t) => t.id === this.templateId);
    if (template) {
      this.certificateType = template.certificateType;
      if (!this.title) {
        this.title = template.name;
      }
    }
  }

  async onSave(): Promise<void> {
    if (!this.studentId || !this.title.trim() || !this.issuedBy.trim()) {
      this.toast.error('Student, title, and issued by are required');
      return;
    }
    this.saving = true;
    try {
      await this.certificateService.create({
        studentId: this.studentId,
        templateId: this.templateId,
        certificateType: this.certificateType,
        title: this.title.trim(),
        description: this.description.trim() || null,
        issueDate: this.issueDate,
        issuedBy: this.issuedBy.trim(),
        attachmentUrl: this.attachmentUrl.trim() || null,
        status: 'issued',
      });
      this.toast.success('Certificate issued');
      this.router.navigate(['/certificates']);
    } catch {
      try {
        await this.certificateService.createOffline({
          studentId: this.studentId,
          templateId: this.templateId,
          certificateType: this.certificateType,
          title: this.title.trim(),
          description: this.description.trim() || null,
          issueDate: this.issueDate,
          issuedBy: this.issuedBy.trim(),
          attachmentUrl: this.attachmentUrl.trim() || null,
          status: 'issued',
        });
        this.toast.success('Certificate saved offline — will sync when online');
        this.router.navigate(['/certificates']);
      } catch {
        this.toast.error('Failed to issue certificate');
      }
    } finally {
      this.saving = false;
    }
  }
}
