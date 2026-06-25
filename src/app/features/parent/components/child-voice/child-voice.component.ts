import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';

@Component({
  selector: 'app-child-voice',
  standalone: true,
  imports: [],
  template: `
    <section class="child-page card">
      <h2>Voice History</h2>
      @if (loading) { <p class="empty">Loading…</p> }
      @else {
        <ul class="list">
          @for (entry of entries; track entry['id']) {
            <li>
              <strong>{{ entry['moduleCode'] }}</strong>
              <span>{{ entry['status'] }} · {{ formatDate(asString(entry['createdAt'])) }}</span>
              <p>{{ entry['transcriptPreview'] || asString(entry['transcript']).slice(0, 120) }}</p>
            </li>
          } @empty { <li class="empty">No voice entries</li> }
        </ul>
      }
    </section>
  `,
  styles: [`
    .child-page { padding: 1rem 1.25rem; }
    .list { list-style: none; margin: 0; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
    span, p { display: block; color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0 0; }
    .empty { color: #6b7280; }
  `],
})
export class ChildVoiceComponent implements OnInit {
  studentId = 0;
  entries: Array<Record<string, unknown>> = [];
  loading = true;

  constructor(private route: ActivatedRoute, private parentPortal: ParentPortalService) {}

  async ngOnInit(): Promise<void> {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    try {
      this.entries = (await this.parentPortal.getChildVoice(this.studentId)) as Record<string, unknown>[];
    } finally {
      this.loading = false;
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  asString(value: unknown): string {
    return value == null ? '' : String(value);
  }
}
