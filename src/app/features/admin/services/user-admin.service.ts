import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ManagedUser, UserRole } from '../../../core/models/auth.model';

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  linkedStudentId?: number;
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  constructor(private api: ApiService) {}

  listUsers(): Promise<ManagedUser[]> {
    return this.api.get<ManagedUser[]>('/users');
  }

  createUser(payload: CreateUserPayload): Promise<ManagedUser> {
    return this.api.post<ManagedUser>('/users', payload);
  }

  updateUser(id: number, payload: Partial<CreateUserPayload & { status: string }>): Promise<ManagedUser> {
    return this.api.put<ManagedUser>(`/users/${id}`, payload);
  }

  deleteUser(id: number): Promise<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/users/${id}`);
  }

  linkStudent(userId: number, studentId: number, relationship = 'guardian'): Promise<unknown> {
    return this.api.post(`/users/${userId}/link-student`, { studentId, relationship });
  }
}
