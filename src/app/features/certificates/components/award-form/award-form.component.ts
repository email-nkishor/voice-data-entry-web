import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AwardService } from '../../../../core/services/award.service';
import { StudentService } from '../../../student/services/student.service';
import { Student } from '../../../student/models/student.model';
import { AWARD_CATEGORIES, AwardCategory } from '../../../../core/models/certificate.model';

@Component({
  selector: 'app-award-form',
  standalone: true,
  imports: [FormsModule, ModuleActionHeaderComponent],
  templateUrl: './award-form.component.html',
})
export class AwardFormComponent implements OnInit {
  students: Student[] = [];
  categories = AWARD_CATEGORIES;
  studentId = 0;
  category: AwardCategory = 'academic';
  title = '';
  description = '';
  awardDate = new Date().toISOString().slice(0, 10);
  issuedBy = '';
  attachmentUrl = '';
  isRecommend = false;
  saving = false;

  constructor(
    private awardService: AwardService,
    private studentService: StudentService,
    private permissionService: PermissionService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.isRecommend =
      this.permissionService.canRecommendAward() && !this.permissionService.canCreateAward();
    if (this.authService.currentUser?.name) {
      this.issuedBy = this.authService.currentUser.name;
    }
  }

  async ngOnInit(): Promise<void> {
    this.students = await this.studentService.getAll();
  }

  async onSave(): Promise<void> {
    if (!this.studentId || !this.title.trim()) {
      this.toast.error('Student and title are required');
      return;
    }
    this.saving = true;
    try {
      const input = {
        studentId: this.studentId,
        category: this.category,
        title: this.title.trim(),
        description: this.description.trim() || null,
        awardDate: this.awardDate,
        issuedBy: this.issuedBy.trim() || null,
        attachmentUrl: this.attachmentUrl.trim() || null,
        status: this.isRecommend ? ('recommended' as const) : ('issued' as const),
      };
      if (this.isRecommend) {
        await this.awardService.recommend(input);
        this.toast.success('Award recommended for approval');
      } else {
        await this.awardService.create(input);
        this.toast.success('Award added');
      }
      this.router.navigate(['/certificates/awards']);
    } catch {
      this.toast.error('Failed to save award');
    } finally {
      this.saving = false;
    }
  }
}
