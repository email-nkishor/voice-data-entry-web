import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = 'clerk@institute.local';
  password = 'clerk123';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting = true;
    try {
      await this.authService.login(this.email.trim(), this.password);
      this.toastService.success('Signed in successfully');
      this.router.navigate(['/dashboard']);
    } catch {
      this.toastService.error('Invalid email or password. Is the API running?');
    } finally {
      this.isSubmitting = false;
    }
  }
}
