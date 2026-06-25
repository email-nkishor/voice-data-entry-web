export type VoiceEntryStatus = 'draft' | 'processed' | 'saved' | 'failed';

export interface VoiceEntryRecord {
  id: number;
  organizationId: number;
  studentId: number | null;
  studentName?: string | null;
  entityType: string | null;
  entityId: number | null;
  moduleCode: string;
  transcript: string;
  transcriptPreview?: string;
  processedJson: Record<string, unknown> | null;
  audioUrl: string | null;
  speechEngine: string | null;
  status: VoiceEntryStatus;
  createdBy: number | null;
  createdByName?: string | null;
  clientId?: number | null;
  createdAt: string;
  modifiedAt: string;
  syncStatus?: 'synced' | 'pending';
}

export interface VoiceEntryEditRecord {
  id: number;
  voiceEntryId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  editedBy: number | null;
  editedByName?: string | null;
  editedAt: string;
}

export interface VoiceEntryInput {
  studentId?: number | null;
  entityType?: string | null;
  entityId?: number | null;
  moduleCode: string;
  transcript: string;
  processedJson?: Record<string, unknown> | null;
  audioUrl?: string | null;
  speechEngine?: string | null;
  status?: VoiceEntryStatus;
  clientId?: number | null;
}

export interface VoiceEntryFilters {
  studentId?: number;
  moduleCode?: string;
  status?: VoiceEntryStatus;
  speechEngine?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VoiceEntryListResponse {
  items: VoiceEntryRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface VoiceEntryStats {
  total: number;
  recent30Days: number;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
  bySpeechEngine: Record<string, number>;
}
