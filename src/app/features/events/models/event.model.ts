export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';
export type EventType = 'academic' | 'sports' | 'cultural' | 'other';

export interface EventRecord {
  id: number;
  serverId?: number;
  title: string;
  description: string | null;
  eventType: EventType;
  startDate: string;
  endDate: string | null;
  location: string | null;
  groupId: number | null;
  createdBy: number | null;
  status: EventStatus;
  clientId?: number | null;
  syncStatus?: 'pending' | 'synced';
  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  title: string;
  description?: string;
  eventType?: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  groupId?: number;
  status?: EventStatus;
}
