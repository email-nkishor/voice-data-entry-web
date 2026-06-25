import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ManagedUser, UserRole } from '../../../../core/models/auth.model';
import { CreateUserPayload, UserAdminService } from '../../services/user-admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink, ModuleActionHeaderComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  users: ManagedUser[] = [];
  loading = true;
  showForm = false;
  saving = false;

  form: CreateUserPayload = {
    email: '',
    password: '',
    name: '',
    role: 'clerk',
  };

  roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'clerk', label: 'Clerk' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'parent', label: 'Parent' },
    { value: 'student', label: 'Student' },
  ];

  constructor(
    private userAdminService: UserAdminService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      this.users = await this.userAdminService.listUsers();
    } catch {
      this.toast.error('Failed to load users. Ensure API is online.');
    } finally {
      this.loading = false;
    }
  }

  openForm(): void {
    this.form = { email: '', password: '', name: '', role: 'clerk' };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  async saveUser(): Promise<void> {
    if (!this.form.email || !this.form.password || !this.form.name) {
      this.toast.error('Email, password, and name are required');
      return;
    }
    this.saving = true;
    try {
      await this.userAdminService.createUser(this.form);
      this.toast.success('User created');
      this.showForm = false;
      await this.loadUsers();
    } catch {
      this.toast.error('Failed to create user');
    } finally {
      this.saving = false;
    }
  }

  async deleteUser(user: ManagedUser): Promise<void> {
    if (!confirm(`Delete user ${user.name}?`)) {
      return;
    }
    try {
      await this.userAdminService.deleteUser(user.id);
      this.toast.success('User deleted');
      await this.loadUsers();
    } catch {
      this.toast.error('Failed to delete user');
    }
  }

  roleLabel(role: UserRole): string {
    if (role === 'admission_clerk') {
      return 'Clerk';
    }
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}
