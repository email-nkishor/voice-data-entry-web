import { DashboardNavItem, DashboardNavSection } from './models/dashboard-nav.model';

export function getNavItemsForRole(role: string, options?: { parentPortalEnabled?: boolean }): DashboardNavItem[] {
  const all: DashboardNavItem[] = [
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
      title: 'Voice History',
      description: 'Transcripts, AI extraction & edit audit trail',
      route: '/voice-history',
      iconClass: 'fa-solid fa-microphone-lines',
      roles: ['admin', 'clerk', 'admission_clerk', 'teacher', 'student', 'parent'],
      section: 'voice',
    },
    {
      title: 'Attendance',
      description: 'Daily grid, reports & voice entry',
      route: '/attendance',
      iconClass: 'fa-solid fa-clipboard-check',
      roles: ['admin', 'clerk', 'admission_clerk', 'teacher', 'student', 'parent'],
      section: 'school',
    },
    {
      title: 'Events',
      description: 'Create and manage institute events',
      route: '/events',
      iconClass: 'fa-solid fa-calendar-days',
      roles: ['admin', 'clerk', 'admission_clerk', 'teacher', 'student', 'parent'],
      section: 'school',
    },
    {
      title: 'Certificates & Awards',
      description: 'Issue certificates, manage awards & achievements',
      route: '/certificates',
      iconClass: 'fa-solid fa-award',
      roles: ['admin', 'clerk', 'admission_clerk', 'teacher', 'student', 'parent'],
      section: 'school',
    },
    {
      title: 'Reports & Analytics',
      description: 'KPIs, trends, activity feed & exports',
      route: '/reports',
      iconClass: 'fa-solid fa-chart-line',
      roles: ['admin', 'clerk', 'admission_clerk', 'teacher', 'student', 'parent'],
      section: 'school',
    },
    {
      title: 'User Management',
      description: 'Create staff, parent & student accounts',
      route: '/admin/users',
      iconClass: 'fa-solid fa-users-gear',
      roles: ['admin'],
      section: 'admin',
    },
    {
      title: 'Organization Settings',
      description: 'School name, parent portal & configuration',
      route: '/admin/organization',
      iconClass: 'fa-solid fa-building',
      roles: ['admin'],
      section: 'admin',
    },
    {
      title: 'Custom Fields',
      description: 'Organization-specific student attributes',
      route: '/admin/custom-fields',
      iconClass: 'fa-solid fa-sliders',
      roles: ['admin'],
      section: 'admin',
    },
  ];

  const normalized = role === 'admission_clerk' ? 'clerk' : role;

  if (role === 'parent') {
    if (options?.parentPortalEnabled) {
      return [
        {
          title: 'Parent Portal',
          description: 'View your children\'s profiles, achievements & events',
          route: '/parent',
          iconClass: 'fa-solid fa-people-roof',
          roles: ['parent'],
          section: 'school',
        },
      ];
    }
    return [
      {
        title: 'Parent Portal Unavailable',
        description: 'Contact your school administrator to enable the parent portal',
        route: '/dashboard',
        iconClass: 'fa-solid fa-circle-info',
        roles: ['parent'],
        section: 'school',
      },
    ];
  }

  const filtered = all.filter((item) =>
    item.roles.some((r) => r === role || r === normalized)
  );

  if (options?.parentPortalEnabled === false) {
    return filtered;
  }

  return filtered;
}

export function groupNavItemsBySection(items: DashboardNavItem[]): Record<DashboardNavSection, DashboardNavItem[]> {
  const groups: Record<DashboardNavSection, DashboardNavItem[]> = {
    voice: [],
    school: [],
    admin: [],
  };
  for (const item of items) {
    groups[item.section].push(item);
  }
  return groups;
}
