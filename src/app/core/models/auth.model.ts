export type UserRole = 'admin' | 'admission_clerk' | 'teacher';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
