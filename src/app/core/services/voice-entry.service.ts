import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { SyncQueueService } from './sync-queue.service';
import { VoiceSessionService } from './voice-session.service';
import {
  VoiceEntryEditRecord,
  VoiceEntryFilters,
  VoiceEntryInput,
  VoiceEntryListResponse,
  VoiceEntryRecord,
  VoiceEntryStats,
} from '../models/voice-entry.model';

@Injectable({ providedIn: 'root' })
export class VoiceEntryService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService,
    private voiceSession: VoiceSessionService
  ) {}

  list(filters: VoiceEntryFilters = {}): Promise<VoiceEntryListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return this.api
      .get<VoiceEntryListResponse>(`/voice-entries${qs ? `?${qs}` : ''}`)
      .then(async (response) => {
        await this.cacheEntries(response.items);
        return response;
      })
      .catch(async () => this.listFromCache(filters));
  }

  getById(id: number): Promise<VoiceEntryRecord | undefined> {
    return this.api
      .get<VoiceEntryRecord>(`/voice-entries/${id}`)
      .then(async (entry) => {
        await this.databaseService.db.voiceEntries.put({ ...entry, syncStatus: 'synced' });
        return entry;
      })
      .catch(() => this.databaseService.db.voiceEntries.get(id));
  }

  getEdits(voiceEntryId: number): Promise<VoiceEntryEditRecord[]> {
    return this.api.get<VoiceEntryEditRecord[]>(`/voice-entries/${voiceEntryId}/edits`);
  }

  getForStudent(studentId: number, limit = 10): Promise<VoiceEntryRecord[]> {
    return this.api
      .get<VoiceEntryRecord[]>(`/voice-entries/student/${studentId}?limit=${limit}`)
      .catch(() =>
        this.databaseService.db.voiceEntries
          .where('studentId')
          .equals(studentId)
          .reverse()
          .limit(limit)
          .toArray()
      );
  }

  getStats(): Promise<VoiceEntryStats> {
    return this.api.get<VoiceEntryStats>('/voice-entries/stats');
  }

  create(input: VoiceEntryInput): Promise<VoiceEntryRecord> {
    return this.api.post<VoiceEntryRecord>('/voice-entries', input).then(async (created) => {
      await this.databaseService.db.voiceEntries.put({ ...created, syncStatus: 'synced' });
      return created;
    });
  }

  update(id: number, input: Partial<VoiceEntryInput>): Promise<VoiceEntryRecord> {
    return this.api.put<VoiceEntryRecord>(`/voice-entries/${id}`, input).then(async (updated) => {
      await this.databaseService.db.voiceEntries.put({ ...updated, syncStatus: 'synced' });
      return updated;
    });
  }

  async persistFromSession(options: {
    studentId?: number | null;
    entityType?: string | null;
    entityId?: number | null;
    formValues?: Record<string, string>;
    status?: VoiceEntryInput['status'];
  }): Promise<VoiceEntryRecord | null> {
    const snapshot = this.voiceSession.getSnapshot();
    if (!snapshot) {
      return null;
    }

    const processedJson = options.formValues
      ? { ...snapshot.processedJson, ...options.formValues }
      : snapshot.processedJson;

    const clientId = Date.now();
    const payload: VoiceEntryInput = {
      moduleCode: snapshot.moduleCode,
      transcript: snapshot.transcript,
      processedJson,
      speechEngine: snapshot.speechEngine,
      studentId: options.studentId ?? null,
      entityType: options.entityType ?? snapshot.moduleCode,
      entityId: options.entityId ?? options.studentId ?? null,
      status: options.status ?? 'saved',
      clientId,
    };

    try {
      const created = await this.create(payload);
      this.voiceSession.reset();
      return created;
    } catch {
      const now = new Date().toISOString();
      const local: VoiceEntryRecord = {
        id: clientId,
        organizationId: 1,
        studentId: payload.studentId ?? null,
        entityType: payload.entityType ?? null,
        entityId: payload.entityId ?? null,
        moduleCode: payload.moduleCode,
        transcript: payload.transcript,
        processedJson: payload.processedJson ?? null,
        audioUrl: null,
        speechEngine: payload.speechEngine ?? null,
        status: payload.status ?? 'saved',
        createdBy: null,
        clientId,
        createdAt: now,
        modifiedAt: now,
        syncStatus: 'pending',
      };
      await this.databaseService.db.voiceEntries.put(local);
      await this.syncQueueService.enqueue('voiceEntry', 'create', payload, clientId);
      this.voiceSession.reset();
      return local;
    }
  }

  private async cacheEntries(items: VoiceEntryRecord[]): Promise<void> {
    for (const item of items) {
      await this.databaseService.db.voiceEntries.put({ ...item, syncStatus: 'synced' });
    }
  }

  private async listFromCache(filters: VoiceEntryFilters): Promise<VoiceEntryListResponse> {
    let items = await this.databaseService.db.voiceEntries.orderBy('createdAt').reverse().toArray();

    if (filters.studentId !== undefined) {
      items = items.filter((e) => e.studentId === filters.studentId);
    }
    if (filters.moduleCode) {
      items = items.filter((e) => e.moduleCode === filters.moduleCode);
    }
    if (filters.status) {
      items = items.filter((e) => e.status === filters.status);
    }
    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      items = items.filter(
        (e) =>
          e.transcript.toLowerCase().includes(term)
          || JSON.stringify(e.processedJson ?? {}).toLowerCase().includes(term)
      );
    }

    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 50;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      limit,
      offset,
    };
  }
}
