export interface StudentGroup {
  id?: number;
  name: string;
  description?: string;
  createdDate: string;
  isDefault?: boolean;
  serverId?: number;
  syncStatus?: 'pending' | 'synced';
}
