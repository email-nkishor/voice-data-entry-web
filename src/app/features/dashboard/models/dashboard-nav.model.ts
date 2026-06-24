export interface DashboardNavItem {
  title: string;
  description: string;
  route: string;
  iconClass: string;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: 'Student Admission',
    description: 'Dashboard, groups & student records',
    route: '/student/dashboard',
    iconClass: 'fa-solid fa-user-graduate',
  },
  {
    title: 'Attendance',
    description: 'Track daily attendance',
    route: '/attendance',
    iconClass: 'fa-solid fa-clipboard-check',
  },
  {
    title: 'Expenses',
    description: 'Record expenses',
    route: '/expense',
    iconClass: 'fa-solid fa-indian-rupee-sign',
  },
  {
    title: 'Inventory',
    description: 'Manage stock items',
    route: '/inventory',
    iconClass: 'fa-solid fa-boxes-stacked',
  },
  {
    title: 'Surveys',
    description: 'Collect feedback',
    route: '/survey',
    iconClass: 'fa-solid fa-comments',
  },
  {
    title: 'Hospital Registration',
    description: 'Register patients',
    route: '/patient',
    iconClass: 'fa-solid fa-hospital',
  },
];
