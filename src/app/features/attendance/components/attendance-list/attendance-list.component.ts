import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { AttendanceWithStudent } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  template: `
    <div class="page">
      <app-module-action-header title="Attendance" backLink="/dashboard" />
      <div class="toolbar">
        <a routerLink="/attendance/entry" class="btn btn-primary">Mark Attendance</a>
      </div>
      <div class="list">
        @for (record of records; track record.id) {
          <article class="card list-item">
            <h3>{{ record.studentName || ('Student #' + record.studentId) }}</h3>
            <p>Date: {{ record.attendanceDate }}</p>
            <p>Status: {{ record.status }}</p>
          </article>
        } @empty { <p class="empty">No attendance records.</p> }
      </div>
    </div>
  `,
})
export class AttendanceListComponent implements OnInit {
  records: AttendanceWithStudent[] = [];
  constructor(private attendanceService: AttendanceService) {}
  async ngOnInit(): Promise<void> {
    this.records = await this.attendanceService.getAll();
  }
}
