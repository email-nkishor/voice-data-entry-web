import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { EventInput, EventRecord } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async list(groupId?: number, status?: string): Promise<EventRecord[]> {
    try {
      const params = new URLSearchParams();
      if (groupId) params.set('groupId', String(groupId));
      if (status) params.set('status', status);
      const qs = params.toString();
      const remote = await this.api.get<EventRecord[]>(`/events${qs ? `?${qs}` : ''}`);
      for (const event of remote) {
        await this.databaseService.db.events.put({ ...event, syncStatus: 'synced', serverId: event.id });
      }
      return remote;
    } catch {
      return this.listLocal(groupId, status);
    }
  }

  async listLocal(groupId?: number, status?: string): Promise<EventRecord[]> {
    let items = await this.databaseService.db.events.orderBy('startDate').toArray();
    if (groupId) items = items.filter((e) => e.groupId === groupId);
    if (status) items = items.filter((e) => e.status === status);
    return items;
  }

  getById(id: number): Promise<EventRecord> {
    return this.api.get<EventRecord>(`/events/${id}`);
  }

  async create(input: EventInput): Promise<EventRecord> {
    try {
      return await this.api.post<EventRecord>('/events', input);
    } catch {
      return this.createLocal(input);
    }
  }

  private async createLocal(input: EventInput): Promise<EventRecord> {
    const now = new Date().toISOString();
    const clientId = Date.now();
    const record: EventRecord = {
      id: clientId,
      serverId: undefined,
      title: input.title,
      description: input.description ?? null,
      eventType: input.eventType ?? 'other',
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      location: input.location ?? null,
      groupId: input.groupId ?? null,
      createdBy: null,
      status: input.status ?? 'draft',
      clientId,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    await this.databaseService.db.events.put(record);
    await this.syncQueueService.enqueue('event', 'create', record, clientId);
    return record;
  }

  update(id: number, input: Partial<EventInput>): Promise<EventRecord> {
    return this.api.put<EventRecord>(`/events/${id}`, input);
  }

  delete(id: number): Promise<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/events/${id}`);
  }

  addParticipants(eventId: number, studentIds: number[]): Promise<unknown[]> {
    return this.api.post<unknown[]>(`/events/${eventId}/participants`, { studentIds });
  }

  listParticipants(eventId: number): Promise<{ id: number; eventId: number; studentId: number; registrationStatus: string }[]> {
    return this.api.get(`/events/${eventId}/participants`);
  }
}
