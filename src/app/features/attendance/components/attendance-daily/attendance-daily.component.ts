import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentGroupService } from '../../../student/services/student-group.service';
import { StudentGroup } from '../../../student/models/student-group.model';
import { AttendanceGridRow, AttendanceStatus } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-daily',
  standalone: true,
  imports: [FormsModule, RouterLink, ModuleActionHeaderComponent],
  templateUrl: './attendance-daily.component.html',
  styleUrl: './attendance-daily.component.scss',
})
export class AttendanceDailyComponent implements OnInit {
  groups: StudentGroup[] = [];
  grid: AttendanceGridRow[] = [];
  groupId: number | null = null;
  date = new Date().toISOString().slice(0, 10);
  loading = false;
  saving = false;
  canMark = false;
  statusOptions: AttendanceStatus[] = [];
  marks = new Map<number, AttendanceStatus>();

  constructor(
    private attendanceService: AttendanceService,
    private groupService: StudentGroupService,
    private permissionService: PermissionService,
    private toast: ToastService
  ) {
    this.canMark = this.permissionService.canMarkAttendance();
    this.statusOptions = this.attendanceService.getStatusOptions();
  }

  async ngOnInit(): Promise<void> {
    this.groups = await this.groupService.getAll();
    if (this.groups.length) {
      this.groupId = this.groups[0].id ?? null;
      await this.loadGrid();
    }
  }

  async loadGrid(): Promise<void> {
    if (!this.groupId) {
      return;
    }
    this.loading = true;
    try {
      this.grid = await this.attendanceService.getDailyGrid(this.groupId, this.date);
      this.marks.clear();
      for (const row of this.grid) {
        this.marks.set(row.student.id, row.attendance?.status ?? 'present');
      }
    } catch {
      this.toast.error('Failed to load attendance grid. Ensure API is online.');
      this.grid = [];
    } finally {
      this.loading = false;
    }
  }

  setStatus(studentId: number, status: AttendanceStatus): void {
    this.marks.set(studentId, status);
  }

  async saveAll(): Promise<void> {
    if (!this.groupId) {
      return;
    }
    this.saving = true;
    try {
      const records = this.grid.map((row) => ({
        studentId: row.student.id,
        status: this.marks.get(row.student.id) ?? 'present',
      }));
      await this.attendanceService.bulkMark({
        groupId: this.groupId,
        attendanceDate: this.date,
        contextType: 'daily',
        records,
      });
      this.toast.success('Attendance saved');
      await this.loadGrid();
    } catch {
      this.toast.error('Failed to save attendance');
    } finally {
      this.saving = false;
    }
  }

  statusLabel(status: AttendanceStatus): string {
    return this.attendanceService.statusLabel(status);
  }
}
