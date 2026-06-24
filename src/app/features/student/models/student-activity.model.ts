export interface StudentActivity {
  id?: number;
  studentId: number;
  action: 'create' | 'update' | 'delete' | 'admission_approved' | 'status_change';
  message: string;
  actionDate: string;
  loggedDate: string;
}
