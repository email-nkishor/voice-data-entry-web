export interface ParentChildSummary {
  studentId: number;
  code: string;
  name: string;
  class: string;
  section: string | null;
  status: string;
  relationshipType: string;
  isPrimaryContact: boolean;
}

export interface ParentDashboardData {
  childrenCount: number;
  selectedStudentId: number | null;
  children: ParentChildSummary[];
  upcomingEvents: unknown[];
  recentCertificates: unknown[];
  recentAwards: unknown[];
  recentVoiceEntries: unknown[];
  achievementSummary: {
    certificates: number;
    awards: number;
    voiceEntries: number;
    eventsParticipated: number;
  };
  parentAttendanceEnabled: boolean;
  attendanceComingSoon: boolean;
  attendanceSummary?: ParentAttendanceSummary;
  recentAbsences?: ParentAttendanceRecord[];
  absenceAlertCount?: number;
}

export interface ParentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface ParentAttendanceRecord {
  id: number;
  studentId: number;
  groupId: number | null;
  eventId: number | null;
  attendanceDate: string;
  contextType: string;
  periodNumber: number | null;
  status: string;
  remarks: string | null;
  markedBy: number | null;
  clientId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  userId: number | null;
  organizationId: number;
  status: string;
  childrenCount: number;
}

export interface ParentNotificationPreferences {
  parentId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  eventAssigned: boolean;
  certificateIssued: boolean;
  awardAdded: boolean;
  attendanceAlert: boolean;
  updatedAt: string;
}
