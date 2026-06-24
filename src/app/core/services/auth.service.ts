import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthUser, LoginResponse } from '../models/auth.model';
import { ApiService } from './api.service';

const TOKEN_KEY = 'vde_auth_token';
const USER_KEY = 'vde_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
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
    return !!user && roles.includes(user.role);
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await this.apiService.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.userSubject.next(response.user);
    return response.user;
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
