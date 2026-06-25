export type DashboardNavSection = 'voice' | 'school' | 'admin';

export interface DashboardNavItem {
  title: string;
  description: string;
  route: string;
  iconClass: string;
  roles: string[];
  section: DashboardNavSection;
}

/** @deprecated Use getNavItemsForRole() for role-aware navigation */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: 'Student Dashboard',
    description: 'Groups, student records & voice admission',
    route: '/student/dashboard',
    iconClass: 'fa-solid fa-user-graduate',
    roles: ['admin', 'clerk', 'admission_clerk', 'teacher'],
    section: 'voice',
  },
  {
    title: 'Expenses',
    description: 'Record expenses with voice entry',
    route: '/expense',
    iconClass: 'fa-solid fa-indian-rupee-sign',
    roles: ['admin', 'clerk', 'admission_clerk'],
    section: 'voice',
  },
  {
    title: 'Inventory',
    description: 'Manage stock items with voice entry',
    route: '/inventory',
    iconClass: 'fa-solid fa-boxes-stacked',
    roles: ['admin', 'clerk', 'admission_clerk'],
    section: 'voice',
  },
  {
    title: 'Surveys',
    description: 'Collect feedback with voice entry',
    route: '/survey',
    iconClass: 'fa-solid fa-comments',
    roles: ['admin', 'clerk', 'admission_clerk', 'teacher'],
    section: 'voice',
  },
  {
    title: 'Hospital Registration',
    description: 'Register patients with voice entry',
    route: '/patient',
    iconClass: 'fa-solid fa-hospital',
    roles: ['admin', 'clerk', 'admission_clerk'],
    section: 'voice',
  },
  {
    title: 'Attendance',
    description: 'Track daily attendance',
    route: '/attendance',
    iconClass: 'fa-solid fa-clipboard-check',
    roles: ['admin', 'clerk', 'admission_clerk', 'teacher'],
    section: 'school',
  },
];
