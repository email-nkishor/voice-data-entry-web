import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrganizationService } from '../services/organization.service';

export const parentAttendanceGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const orgService = inject(OrganizationService);
  const router = inject(Router);

  if (!auth.isLoggedIn || !auth.hasRole('parent')) {
    return router.createUrlTree(['/dashboard']);
  }

  try {
    if (!orgService.current) {
      await orgService.loadCurrent();
    }
  } catch {
    return router.createUrlTree(['/parent/dashboard']);
  }

  if (!orgService.isParentAttendanceEnabled()) {
    return router.createUrlTree(['/parent/dashboard']);
  }

  return true;
};
