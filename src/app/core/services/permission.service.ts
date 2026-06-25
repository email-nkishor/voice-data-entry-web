import { Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../models/auth.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private authService: AuthService) {}

  hasPermission(module: string, action: string): boolean {
    const user = this.authService.currentUser;
    if (!user) {
      return false;
    }
    const key = `${module}:${action}`;
    return user.permissions.some((p) => p.key === key);
  }

  hasRole(...roles: UserRole[]): boolean {
    return this.authService.hasRole(...roles);
  }

  canManageUsers(): boolean {
    return this.hasPermission('user', 'manage');
  }

  canCreateStudent(): boolean {
    return this.hasPermission('student', 'create');
  }

  canEditStudent(): boolean {
    return this.hasPermission('student', 'edit');
  }

  canDeleteStudent(): boolean {
    return this.hasPermission('student', 'delete');
  }

  canManageGroups(): boolean {
    return this.hasPermission('group', 'create') || this.hasPermission('group', 'modify');
  }

  canAssignStudents(): boolean {
    return this.hasPermission('group', 'assign');
  }

  canManageEvents(): boolean {
    return this.hasPermission('event', 'create');
  }

  canManageCustomFields(): boolean {
    return this.hasPermission('custom_field', 'manage');
  }

  canViewEvents(): boolean {
    return this.hasPermission('event', 'view') || this.hasPermission('event', 'view_own');
  }

  canMarkAttendance(): boolean {
    return this.hasPermission('attendance', 'mark');
  }

  canViewAttendance(): boolean {
    return (
      this.hasPermission('attendance', 'view') ||
      this.hasPermission('attendance', 'view_self') ||
      this.hasPermission('attendance', 'view_child')
    );
  }

  canViewVoiceHistory(): boolean {
    return this.hasPermission('voice', 'view');
  }

  canViewCertificates(): boolean {
    return (
      this.hasPermission('certificate', 'view') ||
      this.hasPermission('certificate', 'view_self') ||
      this.hasPermission('certificate', 'view_child')
    );
  }

  canCreateCertificate(): boolean {
    return this.hasPermission('certificate', 'create');
  }

  canEditCertificate(): boolean {
    return this.hasPermission('certificate', 'edit');
  }

  canRevokeCertificate(): boolean {
    return this.hasPermission('certificate', 'revoke');
  }

  canManageCertificateTemplates(): boolean {
    return this.hasPermission('certificate', 'manage_templates');
  }

  canViewAwards(): boolean {
    return (
      this.hasPermission('award', 'view') ||
      this.hasPermission('award', 'view_self') ||
      this.hasPermission('award', 'view_child')
    );
  }

  canCreateAward(): boolean {
    return this.hasPermission('award', 'create');
  }

  canRecommendAward(): boolean {
    return this.hasPermission('award', 'recommend');
  }

  canCreateVoiceEntry(): boolean {
    return this.hasPermission('voice', 'create');
  }

  canViewReports(): boolean {
    return this.hasPermission('report', 'view') || this.hasPermission('report', 'view_self');
  }

  canAccessParentPortal(): boolean {
    return this.isParent();
  }

  getLinkedStudentIds(): number[] {
    return this.authService.currentUser?.linkedStudentIds ?? [];
  }

  isParent(): boolean {
    return this.authService.hasRole('parent');
  }

  isStudent(): boolean {
    return this.authService.hasRole('student');
  }

  isStaff(): boolean {
    return this.authService.hasRole('admin', 'clerk', 'admission_clerk', 'teacher');
  }

  getScope(module: string, action: string): AuthUser['permissions'][0]['scope'] | undefined {
    const user = this.authService.currentUser;
    if (!user) {
      return undefined;
    }
    const key = `${module}:${action}`;
    return user.permissions.find((p) => p.key === key)?.scope;
  }
}
