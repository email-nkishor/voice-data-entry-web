export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
  id?: number;
  studentId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  syncStatus?: 'pending' | 'synced';
}

export interface AttendanceWithStudent extends Attendance {
  studentName?: string;
}
