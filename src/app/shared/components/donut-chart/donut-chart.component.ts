import { Component, Input, OnChanges } from '@angular/core';
import { DonutSegment } from '../../../features/dashboard/models/student-dashboard.model';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  template: `
    <div class="donut-chart">
      <div class="donut-wrap">
        <div class="donut-ring" [style.background]="gradient"></div>
        <div class="donut-hole">
          <strong>{{ total }}</strong>
        </div>
      </div>
      <ul class="donut-legend">
        @for (segment of segments; track segment.label) {
          <li>
            <span class="swatch" [style.background]="segment.color"></span>
            {{ segment.label }}
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .donut-chart {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.25rem;
    }

    .donut-wrap {
      position: relative;
      width: 140px;
      height: 140px;
      flex-shrink: 0;
    }

    .donut-ring {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .donut-hole {
      position: absolute;
      inset: 26px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      color: #334155;
      box-shadow: inset 0 0 0 1px #e2e8f0;
    }

    .donut-legend {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(2, minmax(120px, 1fr));
      gap: 0.35rem 1rem;
      font-size: 0.8rem;
      color: #475569;
    }

    .donut-legend li {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
  `,
})
export class DonutChartComponent implements OnChanges {
  @Input() segments: DonutSegment[] = [];

  total = 0;
  gradient = '#e2e8f0';

  ngOnChanges(): void {
    this.total = this.segments.reduce((sum, segment) => sum + segment.value, 0);
    this.gradient = this.buildGradient(this.segments, this.total);
  }

  private buildGradient(segments: DonutSegment[], total: number): string {
    if (total === 0) {
      return '#e2e8f0';
    }

    let cursor = 0;
    const parts = segments.map((segment) => {
      const start = cursor;
      const slice = (segment.value / total) * 100;
      cursor += slice;
      return `${segment.color} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  }
}
