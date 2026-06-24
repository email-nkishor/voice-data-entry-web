export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DashboardActivity {
  id: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  message: string;
  actionDate: string;
  loggedDate: string;
}

export interface DashboardWorklistItem {
  id: string;
  studentId?: number;
  label: string;
  count: number;
}

export interface DashboardFavorite {
  id: string;
  studentId?: number;
  title: string;
  date: string;
}
