import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { SyncQueueItem } from '../models/sync-queue.model';
import { Student } from '../../features/student/models/student.model';

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  lastError: string | null;
  apiOnline: boolean;
}

export interface SyncPushResult {
  queueId?: number;
  entity: string;
  operation: string;
  clientId?: number;
  serverId?: number;
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly stateSubject = new BehaviorSubject<SyncState>({
    isSyncing: false,
    lastSyncedAt: localStorage.getItem('vde_last_sync') ?? null,
    pendingCount: 0,
    lastError: null,
    apiOnline: false,
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private databaseService: DatabaseService
  ) {}

  get state(): SyncState {
    return this.stateSubject.value;
  }

  async refreshPendingCount(): Promise<number> {
    const pending = await this.databaseService.db.syncQueue.filter((item) => !item.synced).count();
    this.patchState({ pendingCount: pending });
    return pending;
  }

  async checkApiOnline(): Promise<boolean> {
    const online = await this.apiService.healthCheck();
    this.patchState({ apiOnline: online });
    return online;
  }

  async syncAll(): Promise<{ synced: number; failed: number }> {
    if (this.state.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    const online = await this.checkApiOnline();
    if (!online) {
      this.patchState({ lastError: 'API is offline. Start voice-data-entry-api on port 3000.' });
      throw new Error('API offline');
    }

    this.patchState({ isSyncing: true, lastError: null });

    try {
      const pending = await this.databaseService.db.syncQueue
        .filter((item) => !item.synced)
        .sortBy('createdAt');

      if (pending.length === 0) {
        await this.pullFromServer();
        return { synced: 0, failed: 0 };
      }

      const items = pending.map((item) => this.toPushItem(item));
      const response = await this.apiService.post<{
        results: SyncPushResult[];
        synced: number;
        failed: number;
      }>('/sync/push', { items });

      for (const result of response.results) {
        if (!result.success || result.queueId == null) {
          continue;
        }
        await this.databaseService.db.syncQueue.update(result.queueId, { synced: true });
        if (result.entity === 'student' && result.clientId && result.serverId) {
          await this.applyStudentServerId(result.clientId, result.serverId);
        }
        if (result.entity === 'studentGroup' && result.clientId && result.serverId) {
          await this.applyGroupServerId(result.clientId, result.serverId);
        }
      }

      await this.pullFromServer();

      const now = new Date().toISOString();
      localStorage.setItem('vde_last_sync', now);
      await this.refreshPendingCount();
      this.patchState({ lastSyncedAt: now, lastError: null });

      return { synced: response.synced, failed: response.failed };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      this.patchState({ lastError: message });
      throw err;
    } finally {
      this.patchState({ isSyncing: false });
    }
  }

  async pullFromServer(): Promise<void> {
    const since = localStorage.getItem('vde_last_pull') ?? undefined;
    const response = await this.apiService.get<{
      students: Record<string, unknown>[];
      pulledAt: string;
    }>(`/sync/pull${since ? `?since=${encodeURIComponent(since)}` : ''}`);

    for (const row of response.students) {
      await this.mergeServerStudent(row);
    }

    localStorage.setItem('vde_last_pull', response.pulledAt);
  }

  private toPushItem(item: SyncQueueItem) {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(item.payload) as Record<string, unknown>;
    } catch {
      payload = {};
    }
    return {
      queueId: item.id,
      entity: item.entity,
      operation: item.operation,
      entityId: item.entityId,
      clientId: item.entityId,
      payload,
      createdAt: item.createdAt,
    };
  }

  private async applyStudentServerId(clientId: number, serverId: number): Promise<void> {
    const student = await this.databaseService.db.students.get(clientId);
    if (student) {
      await this.databaseService.db.students.update(clientId, {
        serverId,
        syncStatus: 'synced',
      });
    }
  }

  private async applyGroupServerId(clientId: number, serverId: number): Promise<void> {
    const group = await this.databaseService.db.studentGroups.get(clientId);
    if (group) {
      await this.databaseService.db.studentGroups.update(clientId, {
        serverId,
        syncStatus: 'synced',
      });
    }
  }

  private async mergeServerStudent(row: Record<string, unknown>): Promise<void> {
    const clientId = row['clientId'] != null ? Number(row['clientId']) : null;
    const serverId = Number(row['id']);
    const mapped: Student = {
      id: clientId ?? undefined,
      serverId,
      name: String(row['name'] ?? ''),
      class: String(row['class'] ?? ''),
      rollNo: String(row['rollNo'] ?? ''),
      mobile: String(row['mobile'] ?? ''),
      address: String(row['address'] ?? ''),
      admissionNo: row['admissionNo'] != null ? String(row['admissionNo']) : undefined,
      parentName: row['parentName'] != null ? String(row['parentName']) : undefined,
      parentMobile: row['parentMobile'] != null ? String(row['parentMobile']) : undefined,
      academicYear: row['academicYear'] != null ? String(row['academicYear']) : undefined,
      section: row['section'] != null ? String(row['section']) : undefined,
      status: row['status'] as Student['status'],
      feeStatus: row['feeStatus'] as Student['feeStatus'],
      groupId: row['groupId'] != null ? Number(row['groupId']) : undefined,
      customData: row['customData'] != null ? String(row['customData']) : undefined,
      createdDate: String(row['createdDate'] ?? new Date().toISOString()),
      updatedDate: String(row['updatedDate'] ?? new Date().toISOString()),
      syncStatus: 'synced',
    };

    if (clientId) {
      const existing = await this.databaseService.db.students.get(clientId);
      if (existing) {
        await this.databaseService.db.students.put({ ...existing, ...mapped, id: clientId });
        return;
      }
    }

    const existingByServer = await this.databaseService.db.students
      .filter((s) => s.serverId === serverId)
      .first();
    if (existingByServer?.id) {
      await this.databaseService.db.students.put({ ...existingByServer, ...mapped });
      return;
    }

    await this.databaseService.db.students.add({ ...mapped, id: undefined });
  }

  private patchState(patch: Partial<SyncState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...patch });
  }
}
