export interface Student {
  id?: number;
  name: string;
  class: string;
  rollNo: string;
  mobile: string;
  address: string;
  createdDate: string;
  groupId?: number;
  customData?: string;
  syncStatus?: 'pending' | 'synced';
}
