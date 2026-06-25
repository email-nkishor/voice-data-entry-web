import { VoiceEntryRecord } from '../models/voice-entry.model';

export type SyncEntity =
  | 'student'
  | 'studentGroup'
  | 'attendance'
  | 'event'
  | 'eventParticipant'
  | 'customFieldDefinition'
  | 'customFieldValue'
  | 'voiceEntry'
  | 'certificate'
  | 'certificateTemplate'
  | 'award'
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
