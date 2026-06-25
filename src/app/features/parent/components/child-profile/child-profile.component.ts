import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParentPortalService } from '../../../../core/services/parent-portal.service';

@Component({
  selector: 'app-child-profile',
  standalone: true,
  imports: [],
  templateUrl: './child-profile.component.html',
  styleUrl: './child-profile.component.scss',
})
export class ChildProfileComponent implements OnInit {
  studentId = 0;
  profile: Record<string, unknown> | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private parentPortal: ParentPortalService
  ) {}

  async ngOnInit(): Promise<void> {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    try {
      this.profile = (await this.parentPortal.getChildDetail(this.studentId)) as Record<string, unknown>;
    } finally {
      this.loading = false;
    }
  }
}
