import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';

@Component({
  selector: 'app-child-awards',
  standalone: true,
  template: `
    <section class="child-page card">
      <h2>Awards</h2>
      @if (loading) { <p class="empty">Loading…</p> }
      @else {
        <ul class="list">
          @for (award of awards; track award['id']) {
            <li>
              <strong>{{ award['title'] }}</strong>
              <span>{{ award['category'] }} · {{ award['status'] }} · {{ formatDate(asString(award['awardDate'])) }}</span>
            </li>
          } @empty { <li class="empty">No awards</li> }
        </ul>
      }
    </section>
  `,
  styles: [`
    .child-page { padding: 1rem 1.25rem; }
    .list { list-style: none; margin: 0; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
    span { display: block; color: #6b7280; font-size: 0.875rem; }
    .empty { color: #6b7280; }
  `],
})
export class ChildAwardsComponent implements OnInit {
  studentId = 0;
  awards: Array<Record<string, unknown>> = [];
  loading = true;

  constructor(private route: ActivatedRoute, private parentPortal: ParentPortalService) {}

  async ngOnInit(): Promise<void> {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    try {
      this.awards = (await this.parentPortal.getChildAwards(this.studentId)) as Record<string, unknown>[];
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
