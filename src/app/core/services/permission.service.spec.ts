import { TestBed } from '@angular/core/testing';
import { AuthUser } from '../models/auth.model';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let mockUser: AuthUser | null;

  const clerkUser: AuthUser = {
    id: 2,
    email: 'clerk@test.local',
    name: 'Clerk',
    role: 'clerk',
    organizationId: 1,
    permissions: [
      { key: 'student:create', scope: 'all' },
      { key: 'attendance:mark', scope: 'all' },
      { key: 'attendance:view', scope: 'all' },
      { key: 'certificate:view', scope: 'all' },
      { key: 'award:view', scope: 'all' },
    ],
    linkedStudentIds: [],
  };

  const parentUser: AuthUser = {
    id: 4,
    email: 'parent@test.local',
    name: 'Parent',
    role: 'parent',
    organizationId: 1,
    permissions: [
      { key: 'attendance:view_child', scope: 'children' },
      { key: 'certificate:view_child', scope: 'children' },
      { key: 'award:view_child', scope: 'children' },
    ],
    linkedStudentIds: [10],
  };

  const authService = {
    get currentUser() {
      return mockUser;
    },
    hasRole: jasmine.createSpy('hasRole'),
  } as unknown as AuthService;

  beforeEach(() => {
    mockUser = clerkUser;
    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: authService },
      ],
    });
    service = TestBed.inject(PermissionService);
  });

  it('canCreateStudent is true for clerk with student:create', () => {
    expect(service.canCreateStudent()).toBe(true);
  });

  it('canManageUsers is false for clerk', () => {
    expect(service.canManageUsers()).toBe(false);
  });

  it('canMarkAttendance is true for clerk', () => {
    expect(service.canMarkAttendance()).toBe(true);
  });

  it('canViewAttendance uses view_child for parent', () => {
    mockUser = parentUser;
    expect(service.canViewAttendance()).toBe(true);
  });

  it('canViewCertificates uses view_child for parent', () => {
    mockUser = parentUser;
    expect(service.canViewCertificates()).toBe(true);
  });

  it('hasPermission returns false when user is null', () => {
    mockUser = null;
    expect(service.hasPermission('student', 'create')).toBe(false);
  });
});
