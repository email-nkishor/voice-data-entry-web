import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';

@Component({
  selector: 'app-child-certificates',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="child-page card">
      <h2>Certificates</h2>
      @if (loading) { <p class="empty">Loading…</p> }
      @else {
        <ul class="list">
          @for (cert of certificates; track cert['id']) {
            <li>
              <strong>{{ cert['title'] }}</strong>
              <span>{{ cert['certificateNumber'] }} · {{ cert['status'] }} · {{ formatDate(asString(cert['issueDate'])) }}</span>
              @if (cert['attachmentUrl']) {
                <a [href]="$any(cert['attachmentUrl'])" target="_blank" rel="noopener" (click)="onDownload(cert)">Download</a>
              }
              @if (cert['verificationCode']) {
                <a [routerLink]="['/certificates/verify']" [queryParams]="{ code: cert['verificationCode'] }" (click)="onVerify(cert)">Verify</a>
              }
            </li>
          } @empty { <li class="empty">No certificates</li> }
        </ul>
      }
    </section>
  `,
  styles: [`
    .child-page { padding: 1rem 1.25rem; }
    .list { list-style: none; margin: 0; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
    span { display: block; color: #6b7280; font-size: 0.875rem; }
    a { margin-right: 0.75rem; font-size: 0.875rem; }
    .empty { color: #6b7280; }
  `],
})
export class ChildCertificatesComponent implements OnInit {
  studentId = 0;
  certificates: Array<Record<string, unknown>> = [];
  loading = true;

  constructor(private route: ActivatedRoute, private parentPortal: ParentPortalService) {}

  async ngOnInit(): Promise<void> {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    try {
      this.certificates = (await this.parentPortal.getChildCertificates(this.studentId)) as Record<string, unknown>[];
    } finally {
      this.loading = false;
    }
  }

  onDownload(cert: Record<string, unknown>): void {
    void this.parentPortal.logCertificateDownload(this.studentId, Number(cert['id']));
  }

  onVerify(cert: Record<string, unknown>): void {
    void this.parentPortal.logCertificateVerify(this.studentId, Number(cert['id']));
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  asString(value: unknown): string {
    return value == null ? '' : String(value);
  }
}
