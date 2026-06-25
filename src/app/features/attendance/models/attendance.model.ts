export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceContextType = 'daily' | 'period' | 'event';

export interface Attendance {
  id?: number;
  serverId?: number;
  studentId: number;
  groupId?: number | null;
  eventId?: number | null;
  attendanceDate: string;
  contextType?: AttendanceContextType;
  periodNumber?: number | null;
  status: AttendanceStatus;
  remarks?: string | null;
  syncStatus?: 'pending' | 'synced';
}

export interface AttendanceWithStudent extends Attendance {
  studentName?: string;
}

export interface AttendanceGridRow {
  student: { id: number; name: string; rollNo: string };
  attendance: {
    id: number;
    studentId: number;
    status: AttendanceStatus;
    remarks: string | null;
  } | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}
