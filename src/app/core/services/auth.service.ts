import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Organization } from '../models/organization.model';
import { AuthUser, LoginResponse } from '../models/auth.model';
import { ApiService } from './api.service';
import { OrganizationService } from './organization.service';

const TOKEN_KEY = 'vde_auth_token';
const USER_KEY = 'vde_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private organizationService: OrganizationService
  ) {}

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(...roles: AuthUser['role'][]): boolean {
    const user = this.currentUser;
    if (!user) {
      return false;
    }
    const normalized = user.role === 'admission_clerk' ? 'clerk' : user.role;
    const expanded = roles.flatMap((r) =>
      r === 'clerk' || r === 'admission_clerk' ? ['clerk', 'admission_clerk'] : [r]
    );
    return expanded.includes(user.role) || expanded.includes(normalized);
  }

  hasPermission(module: string, action: string): boolean {
    const user = this.currentUser;
    if (!user?.permissions) {
      return false;
    }
    return user.permissions.some((p) => p.key === `${module}:${action}`);
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await this.apiService.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.userSubject.next(response.user);

    if (response.parentPortalEnabled !== undefined) {
      const org: Organization = {
        id: response.user.organizationId,
        name: '',
        code: '',
        settings: {
          parentPortalEnabled: response.parentPortalEnabled,
          parentAttendanceEnabled: response.parentAttendanceEnabled,
        },
        parentPortalEnabled: response.parentPortalEnabled,
        parentAttendanceEnabled: response.parentAttendanceEnabled,
        createdAt: '',
        updatedAt: '',
      };
      localStorage.setItem('vde_org_current', JSON.stringify(org));
    } else {
      try {
        await this.organizationService.loadCurrent();
      } catch {
        // offline or API unavailable
      }
    }

    return response.user;
  }

  getPostLoginRoute(): string {
    const user = this.currentUser;
    if (user?.role === 'parent' && this.organizationService.isParentPortalEnabled()) {
      return '/parent';
    }
    return '/dashboard';
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  async refreshUser(): Promise<void> {
    if (!this.getToken()) {
      return;
    }
    try {
      const response = await this.apiService.get<{ user: AuthUser }>('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      this.userSubject.next(response.user);
    } catch {
      this.logout();
    }
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
