import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentGroupService } from '../../../student/services/student-group.service';
import { StudentGroup } from '../../../student/models/student-group.model';
import { AttendanceSummary } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './attendance-reports.component.html',
  styleUrl: './attendance-reports.component.scss',
})
export class AttendanceReportsComponent implements OnInit {
  groups: StudentGroup[] = [];
  groupId: number | null = null;
  fromDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  toDate = new Date().toISOString().slice(0, 10);
  summary: AttendanceSummary | null = null;
  loading = false;

  constructor(
    private attendanceService: AttendanceService,
    private groupService: StudentGroupService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.groups = await this.groupService.getAll();
    await this.loadSummary();
  }

  async loadSummary(): Promise<void> {
    this.loading = true;
    try {
      this.summary = await this.attendanceService.getSummary({
        groupId: this.groupId ?? undefined,
        fromDate: this.fromDate,
        toDate: this.toDate,
      });
    } catch {
      this.toast.error('Failed to load report');
    } finally {
      this.loading = false;
    }
  }
}
