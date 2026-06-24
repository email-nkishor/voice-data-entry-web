export type PatientGender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id?: number;
  patientName: string;
  age: number;
  gender: PatientGender;
  mobile: string;
  address: string;
  syncStatus?: 'pending' | 'synced';
}
