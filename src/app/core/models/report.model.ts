export interface TrendPoint {
  date: string;
  count: number;
}

export interface ReportKpis {
  totalStudents: number;
  activeStudents: number;
  totalGroups: number;
  totalEvents: number;
  voiceEntries: number;
  certificates: number;
  awards: number;
}

export interface ReportFilters {
  fromDate?: string;
  toDate?: string;
  groupId?: number;
  studentId?: number;
}

export interface ReportActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  entityType?: string;
  entityId?: number;
  occurredAt: string;
}

export interface ReportQuickAction {
  label: string;
  route: string;
  icon: string;
}

export interface DashboardOverview {
  organizationId: number;
  scope: string;
  generatedAt: string;
  filters: ReportFilters;
  kpis: ReportKpis;
  trends: {
    students: TrendPoint[];
    voiceEntries: TrendPoint[];
    certificates: TrendPoint[];
    awards: TrendPoint[];
    events: TrendPoint[];
  };
  breakdowns: {
    studentsByStatus: Record<string, number>;
    studentsByClass: Record<string, number>;
    voiceByModule: Record<string, number>;
    certificatesByType: Record<string, number>;
    awardsByCategory: Record<string, number>;
    eventsByType: Record<string, number>;
  };
  recentActivity: ReportActivityItem[];
  quickActions: ReportQuickAction[];
}

export type ReportExportEntity =
  | 'students'
  | 'voice'
  | 'certificates'
  | 'awards'
  | 'events'
  | 'audit';

export type ReportModule = 'overview' | 'students' | 'voice' | 'certificates' | 'awards' | 'events';
