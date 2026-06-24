import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DonutChartComponent } from '../../../../shared/components/donut-chart/donut-chart.component';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentGroup } from '../../models/student-group.model';
import { StudentGroupService } from '../../services/student-group.service';
import {
  DUMMY_ALERTS,
  DUMMY_CLASS_SEGMENTS,
  DUMMY_FAVORITES,
  DUMMY_RECENT_ACTIVITY,
  DUMMY_STATUS_SEGMENTS,
  DUMMY_WORKLIST,
} from '../../../dashboard/data/student-dashboard.dummy';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, DonutChartComponent, ModuleActionHeaderComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  groups: StudentGroup[] = [];
  selectedGroupId: number | 'all' = 'all';
  showManageGroups = false;
  newGroupName = '';
  newGroupDescription = '';

  statusSegments = DUMMY_STATUS_SEGMENTS;
  classSegments = DUMMY_CLASS_SEGMENTS;
  recentActivity = DUMMY_RECENT_ACTIVITY;
  worklist = DUMMY_WORKLIST;
  alerts = DUMMY_ALERTS;
  favorites = DUMMY_FAVORITES;
  favoriteTab: 'searches' | 'students' = 'searches';

  constructor(
    private studentGroupService: StudentGroupService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadGroups();
  }

  async loadGroups(): Promise<void> {
    this.groups = await this.studentGroupService.getAll();
    if (this.selectedGroupId === 'all' && this.groups[0]?.id) {
      // keep 'all' as default
    }
  }

  get selectedGroupLabel(): string {
    if (this.selectedGroupId === 'all') {
      return 'All Groups';
    }
    return this.groups.find((g) => g.id === this.selectedGroupId)?.name ?? 'All Groups';
  }

  get createStudentLink(): string {
    if (this.selectedGroupId === 'all') {
      return '/student/add';
    }
    return `/student/add?groupId=${this.selectedGroupId}`;
  }

  openStudent(studentId?: number): void {
    if (studentId) {
      this.router.navigate(['/student/view', studentId]);
    }
  }

  openManageGroups(): void {
    this.showManageGroups = true;
  }

  closeManageGroups(): void {
    this.showManageGroups = false;
  }

  async onAddGroup(): Promise<void> {
    const name = this.newGroupName.trim();
    if (!name) {
      this.toastService.error('Group name is required');
      return;
    }

    await this.studentGroupService.add({
      name,
      description: this.newGroupDescription.trim(),
      createdDate: new Date().toISOString(),
    });

    this.newGroupName = '';
    this.newGroupDescription = '';
    await this.loadGroups();
    this.toastService.success('Student group created');
  }

  async onDeleteGroup(group: StudentGroup): Promise<void> {
    if (!group.id) {
      return;
    }
    try {
      await this.studentGroupService.delete(group.id);
      if (this.selectedGroupId === group.id) {
        this.selectedGroupId = 'all';
      }
      await this.loadGroups();
      this.toastService.success('Group removed');
    } catch {
      this.toastService.error('Default group cannot be deleted');
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showManageGroups) {
      this.closeManageGroups();
    }
  }
}
