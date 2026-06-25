export type UserRole = 'admin' | 'clerk' | 'admission_clerk' | 'teacher' | 'student' | 'parent';

export type PermissionScope = 'all' | 'assigned_groups' | 'self' | 'children' | 'own';

export interface UserPermission {
  key: string;
  scope: PermissionScope;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organizationId: number;
  permissions: UserPermission[];
  linkedStudentIds: number[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  parentPortalEnabled?: boolean;
  parentAttendanceEnabled?: boolean;
}

export interface ManagedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  organizationId: number;
  linkedStudentId: number | null;
  createdAt: string;
}
