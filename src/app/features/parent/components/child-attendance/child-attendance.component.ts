import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';
import {
  ParentAttendanceRecord,
  ParentAttendanceSummary,
} from '../../../../core/models/parent-portal.model';

@Component({
  selector: 'app-child-attendance',
  standalone: true,
  template: `
    <section class="child-page card">
      <header class="page-header">
        <h2>Attendance</h2>
        <label>
          <span>Period</span>
          <select [value]="rangeDays" (change)="onRangeChange(+$any($event.target).value)">
            <option [value]="7">Last 7 days</option>
            <option [value]="30">Last 30 days</option>
            <option [value]="90">Last 90 days</option>
          </select>
        </label>
      </header>

      @if (loading) {
        <p class="empty">Loading…</p>
      } @else {
        @if (summary) {
          <div class="summary-grid">
            <article><strong>{{ summary.percentage }}%</strong><span>Present</span></article>
            <article><strong>{{ summary.present }}</strong><span>Present days</span></article>
            <article><strong>{{ summary.absent }}</strong><span>Absent</span></article>
            <article><strong>{{ summary.late }}</strong><span>Late</span></article>
            <article><strong>{{ summary.excused }}</strong><span>Excused</span></article>
          </div>
        }

        @if (absenceAlerts.length) {
          <div class="alert-banner">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ absenceAlerts.length }} absence alert(s) in the last 7 days</span>
          </div>
        }

        <ul class="list">
          @for (record of records; track record.id) {
            <li [class]="statusClass(record.status)">
              <div class="row-main">
                <strong>{{ formatDate(record.attendanceDate) }}</strong>
                <span class="badge">{{ statusLabel(record.status) }}</span>
              </div>
              <span class="meta">
                {{ contextLabel(record.contextType) }}
                @if (record.periodNumber != null) { · Period {{ record.periodNumber }} }
              </span>
              @if (record.remarks) {
                <small>{{ record.remarks }}</small>
              }
            </li>
          } @empty {
            <li class="empty">No attendance records for this period</li>
          }
        </ul>
      }
    </section>
  `,
  styles: [`
    .child-page { padding: 1rem 1.25rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1rem;
      h2 { margin: 0; }
      label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; color: #6b7280; }
      select { min-width: 140px; }
    }
    .summary-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;
      article {
        background: #f9fafb; border-radius: 8px; padding: 0.75rem; text-align: center;
        strong { display: block; font-size: 1.25rem; }
        span { font-size: 0.75rem; color: #6b7280; }
      }
    }
    .alert-banner {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fef3c7; color: #92400e; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem;
    }
    .list { list-style: none; margin: 0; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
    .row-main { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .badge {
      font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 999px; background: #e5e7eb;
    }
    li.absent .badge { background: #fee2e2; color: #b91c1c; }
    li.late .badge { background: #ffedd5; color: #c2410c; }
    li.present .badge { background: #dcfce7; color: #15803d; }
    li.excused .badge { background: #dbeafe; color: #1d4ed8; }
    .meta, small { display: block; color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
    .empty { color: #6b7280; }
  `],
})
export class ChildAttendanceComponent implements OnInit {
  studentId = 0;
  rangeDays = 30;
  records: ParentAttendanceRecord[] = [];
  summary: ParentAttendanceSummary | null = null;
  absenceAlerts: ParentAttendanceRecord[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private parentPortal: ParentPortalService) {}

  async ngOnInit(): Promise<void> {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    await this.loadData();
  }

  async onRangeChange(days: number): Promise<void> {
    this.rangeDays = days;
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    const { fromDate, toDate } = this.dateRange(this.rangeDays);
    const weekFrom = this.dateRange(7).fromDate;
    try {
      const [records, summary] = await Promise.all([
        this.parentPortal.getChildAttendance(this.studentId, { fromDate, toDate }),
        this.parentPortal.getChildAttendanceSummary(this.studentId, { fromDate, toDate }),
      ]);
      this.records = records;
      this.summary = summary;
      this.absenceAlerts = records.filter(
        (r) => r.status === 'absent' && r.attendanceDate >= weekFrom && r.attendanceDate <= toDate
      );
    } finally {
      this.loading = false;
    }
  }

  private dateRange(days: number): { fromDate: string; toDate: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return {
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    };
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  statusClass(status: string): string {
    return status;
  }

  contextLabel(context: string): string {
    if (context === 'period') return 'Period attendance';
    if (context === 'event') return 'Event attendance';
    return 'Daily attendance';
  }
}
