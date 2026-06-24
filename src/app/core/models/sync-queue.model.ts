export type SyncEntity =
  | 'student'
  | 'studentGroup'
  | 'attendance'
  | 'expense'
  | 'inventory'
  | 'survey'
  | 'patient';

export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id?: number;
  entity: SyncEntity;
  entityId?: number;
  operation: SyncOperation;
  payload: string;
  createdAt: string;
  synced: boolean;
}
