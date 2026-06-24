export interface Survey {
  id?: number;
  respondentName: string;
  mobile: string;
  feedback: string;
  surveyDate: string;
  syncStatus?: 'pending' | 'synced';
}
