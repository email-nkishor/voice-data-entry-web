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
        if (result.entity === 'voiceEntry' && result.clientId && result.serverId) {
          await this.databaseService.db.voiceEntries.update(result.clientId, {
            id: result.serverId,
            syncStatus: 'synced',
          });
        }
        if (result.entity === 'certificate' && result.clientId && result.serverId) {
          await this.databaseService.db.certificates.update(result.clientId, {
            id: result.serverId,
            syncStatus: 'synced',
          });
        }
        if (result.entity === 'award' && result.clientId && result.serverId) {
          await this.databaseService.db.awards.update(result.clientId, {
            id: result.serverId,
            syncStatus: 'synced',
          } as never);
        }
        if (result.entity === 'attendance' && result.clientId && result.serverId) {
          await this.databaseService.db.attendance.update(result.clientId, {
            serverId: result.serverId,
            syncStatus: 'synced',
          });
        }
        if (result.entity === 'event' && result.clientId && result.serverId) {
          await this.databaseService.db.events.update(result.clientId, {
            id: result.serverId,
            serverId: result.serverId,
            syncStatus: 'synced',
          });
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
      entities?: {
        students?: Record<string, unknown>[];
        groups?: Record<string, unknown>[];
        attendance?: Record<string, unknown>[];
        events?: Record<string, unknown>[];
        eventParticipants?: Record<string, unknown>[];
        customFieldDefinitions?: Record<string, unknown>[];
        customFieldValues?: Record<string, unknown>[];
        voiceEntries?: Record<string, unknown>[];
        certificateTemplates?: Record<string, unknown>[];
        certificates?: Record<string, unknown>[];
        awards?: Record<string, unknown>[];
        userStudentLinks?: Record<string, unknown>[];
        organizations?: Record<string, unknown>[];
      };
      students?: Record<string, unknown>[];
      groups?: Record<string, unknown>[];
      attendanceRecords?: Record<string, unknown>[];
      events?: Record<string, unknown>[];
      eventParticipants?: Record<string, unknown>[];
      customFieldDefinitions?: Record<string, unknown>[];
      customFieldValues?: Record<string, unknown>[];
      voiceEntries?: Record<string, unknown>[];
      certificateTemplates?: Record<string, unknown>[];
      certificates?: Record<string, unknown>[];
      awards?: Record<string, unknown>[];
      userStudentLinks?: Record<string, unknown>[];
      organizations?: Record<string, unknown>[];
      pulledAt: string;
    }>(`/sync/pull${since ? `?since=${encodeURIComponent(since)}` : ''}`);

    const entities = response.entities ?? {};
    const students = entities.students ?? response.students ?? [];
    const groups = entities.groups ?? response.groups ?? [];
    const attendance = entities.attendance ?? response.attendanceRecords ?? [];
    const events = entities.events ?? response.events ?? [];
    const eventParticipants = entities.eventParticipants ?? response.eventParticipants ?? [];
    const customFieldDefinitions =
      entities.customFieldDefinitions ?? response.customFieldDefinitions ?? [];
    const customFieldValues = entities.customFieldValues ?? response.customFieldValues ?? [];
    const voiceEntries = entities.voiceEntries ?? response.voiceEntries ?? [];
    const certificateTemplates =
      entities.certificateTemplates ?? response.certificateTemplates ?? [];
    const certificates = entities.certificates ?? response.certificates ?? [];
    const awards = entities.awards ?? response.awards ?? [];
    const userStudentLinks = entities.userStudentLinks ?? response.userStudentLinks ?? [];
    const organizations = entities.organizations ?? response.organizations ?? [];

    for (const row of students) {
      await this.mergeServerStudent(row);
    }

    for (const row of groups) {
      await this.mergeServerGroup(row);
    }

    for (const row of attendance) {
      await this.mergeServerAttendance(row);
    }

    for (const row of events) {
      await this.mergeServerEvent(row);
    }

    for (const row of eventParticipants) {
      await this.databaseService.db.eventParticipants.put({
        id: Number(row['id']),
        eventId: Number(row['eventId']),
        studentId: Number(row['studentId']),
        registrationStatus: String(row['registrationStatus'] ?? 'registered'),
      });
    }

    for (const def of customFieldDefinitions) {
      await this.databaseService.db.customFieldDefinitions.put(def as never);
    }

    for (const val of customFieldValues) {
      const entityId = Number(val['entityId']);
      const entityType = String(val['entityType'] ?? 'student');
      await this.databaseService.db.customFieldValues.put({
        fieldDefinitionId: Number(val['fieldDefinitionId']),
        fieldName: val['fieldName'] != null ? String(val['fieldName']) : undefined,
        entityType,
        entityId,
        value: val['value'],
        rawValue: val['rawValue'] != null ? String(val['rawValue']) : undefined,
        syncStatus: 'synced',
        updatedAt: String(val['updatedAt'] ?? new Date().toISOString()),
      });
    }

    for (const row of voiceEntries) {
      await this.databaseService.db.voiceEntries.put({
        id: Number(row['id']),
        organizationId: Number(row['organizationId'] ?? 1),
        studentId: row['studentId'] != null ? Number(row['studentId']) : null,
        studentName: row['studentName'] != null ? String(row['studentName']) : null,
        entityType: row['entityType'] != null ? String(row['entityType']) : null,
        entityId: row['entityId'] != null ? Number(row['entityId']) : null,
        moduleCode: String(row['moduleCode'] ?? ''),
        transcript: String(row['transcript'] ?? ''),
        transcriptPreview: row['transcriptPreview'] != null ? String(row['transcriptPreview']) : undefined,
        processedJson: (row['processedJson'] as Record<string, unknown>) ?? null,
        audioUrl: row['audioUrl'] != null ? String(row['audioUrl']) : null,
        speechEngine: row['speechEngine'] != null ? String(row['speechEngine']) : null,
        status: row['status'] as never,
        createdBy: row['createdBy'] != null ? Number(row['createdBy']) : null,
        createdByName: row['createdByName'] != null ? String(row['createdByName']) : null,
        clientId: row['clientId'] != null ? Number(row['clientId']) : null,
        createdAt: String(row['createdAt'] ?? new Date().toISOString()),
        modifiedAt: String(row['modifiedAt'] ?? new Date().toISOString()),
        syncStatus: 'synced',
      });
    }

    for (const row of certificateTemplates) {
      await this.databaseService.db.certificateTemplates.put(row as never);
    }

    for (const row of certificates) {
      await this.databaseService.db.certificates.put({ ...(row as object), syncStatus: 'synced' } as never);
    }

    for (const row of awards) {
      await this.databaseService.db.awards.put({ ...(row as object), syncStatus: 'synced' } as never);
    }

    for (const row of userStudentLinks) {
      await this.databaseService.db.userStudentLinks.put({
        id: Number(row['id']),
        userId: Number(row['userId']),
        studentId: Number(row['studentId']),
        relationship: String(row['relationship'] ?? 'guardian'),
        isPrimary: Boolean(row['isPrimary']),
        createdAt: String(row['createdAt'] ?? new Date().toISOString()),
      });
    }

    for (const org of organizations) {
      localStorage.setItem('vde_org_current', JSON.stringify(org));
      await this.databaseService.db.organizations.put({
        id: String(org['id'] ?? '1'),
        data: org as never,
        cachedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem('vde_last_pull', response.pulledAt);
    localStorage.setItem('vde_last_sync', response.pulledAt);
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

  private async mergeServerGroup(row: Record<string, unknown>): Promise<void> {
    const clientId = row['clientId'] != null ? Number(row['clientId']) : null;
    const serverId = Number(row['id']);
    const mapped = {
      name: String(row['name'] ?? ''),
      description: row['description'] != null ? String(row['description']) : undefined,
      isDefault: Boolean(row['isDefault']),
      createdDate: String(row['createdDate'] ?? new Date().toISOString()),
      serverId,
      syncStatus: 'synced' as const,
    };

    if (clientId) {
      const existing = await this.databaseService.db.studentGroups.get(clientId);
      if (existing) {
        await this.databaseService.db.studentGroups.put({ ...existing, ...mapped, id: clientId });
        return;
      }
    }

    const existingByServer = await this.databaseService.db.studentGroups
      .filter((g) => g.serverId === serverId)
      .first();
    if (existingByServer?.id) {
      await this.databaseService.db.studentGroups.put({ ...existingByServer, ...mapped });
      return;
    }

    await this.databaseService.db.studentGroups.add({ ...mapped, id: undefined });
  }

  private async mergeServerAttendance(row: Record<string, unknown>): Promise<void> {
    const clientId = row['clientId'] != null ? Number(row['clientId']) : null;
    const serverId = Number(row['id']);
    const mapped = {
      studentId: Number(row['studentId']),
      groupId: row['groupId'] != null ? Number(row['groupId']) : null,
      eventId: row['eventId'] != null ? Number(row['eventId']) : null,
      attendanceDate: String(row['attendanceDate']),
      contextType: row['contextType'] as never,
      periodNumber: row['periodNumber'] != null ? Number(row['periodNumber']) : null,
      status: row['status'] as never,
      remarks: row['remarks'] != null ? String(row['remarks']) : null,
      serverId,
      syncStatus: 'synced' as const,
    };

    if (clientId) {
      const existing = await this.databaseService.db.attendance.get(clientId);
      if (existing) {
        await this.databaseService.db.attendance.put({ ...existing, ...mapped, id: clientId });
        return;
      }
    }

    await this.databaseService.db.attendance.add({ ...mapped, id: undefined });
  }

  private async mergeServerEvent(row: Record<string, unknown>): Promise<void> {
    const clientId = row['clientId'] != null ? Number(row['clientId']) : null;
    const serverId = Number(row['id']);
    const mapped = {
      id: clientId ?? serverId,
      serverId,
      title: String(row['title'] ?? ''),
      description: row['description'] != null ? String(row['description']) : null,
      eventType: row['eventType'] as never,
      startDate: String(row['startDate'] ?? ''),
      endDate: row['endDate'] != null ? String(row['endDate']) : null,
      location: row['location'] != null ? String(row['location']) : null,
      groupId: row['groupId'] != null ? Number(row['groupId']) : null,
      createdBy: row['createdBy'] != null ? Number(row['createdBy']) : null,
      status: row['status'] as never,
      clientId,
      syncStatus: 'synced' as const,
      createdAt: String(row['createdAt'] ?? new Date().toISOString()),
      updatedAt: String(row['updatedAt'] ?? new Date().toISOString()),
    };
    await this.databaseService.db.events.put(mapped);
  }

  private patchState(patch: Partial<SyncState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...patch });
  }
}
