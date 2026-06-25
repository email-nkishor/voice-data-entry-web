import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { SyncQueueService } from './sync-queue.service';
import {
  AwardInput,
  AwardRecord,
  StudentAchievementSummary,
} from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class AwardService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  list(filters: Record<string, string | number | undefined> = {}): Promise<{ items: AwardRecord[]; total: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return this.api
      .get<{ items: AwardRecord[]; total: number }>(`/awards${qs ? `?${qs}` : ''}`)
      .then(async (res) => {
        for (const item of res.items) {
          await this.databaseService.db.awards.put({ ...item, syncStatus: 'synced' });
        }
        return res;
      })
      .catch(() => this.listFromCache(filters));
  }

  getById(id: number): Promise<AwardRecord | undefined> {
    return this.api.get<AwardRecord>(`/awards/${id}`).then(async (item) => {
      await this.databaseService.db.awards.put({ ...item, syncStatus: 'synced' });
      return item;
    });
  }

  getForStudent(studentId: number, limit = 20): Promise<AwardRecord[]> {
    return this.api
      .get<AwardRecord[]>(`/awards/student/${studentId}?limit=${limit}`)
      .catch(() =>
        this.databaseService.db.awards.where('studentId').equals(studentId).reverse().limit(limit).toArray()
      );
  }

  getStudentSummary(studentId: number): Promise<StudentAchievementSummary> {
    return this.api.get<StudentAchievementSummary>(`/awards/student/${studentId}/summary`);
  }

  getStats(): Promise<{ total: number; byCategory: Record<string, number>; byStatus: Record<string, number> }> {
    return this.api.get('/awards/stats');
  }

  create(input: AwardInput): Promise<AwardRecord> {
    return this.api.post<AwardRecord>('/awards', input).then(async (created) => {
      await this.databaseService.db.awards.put({ ...created, syncStatus: 'synced' });
      return created;
    }).catch(() => this.createLocal(input));
  }

  private async createLocal(input: AwardInput): Promise<AwardRecord> {
    const now = new Date().toISOString();
    const record = {
      organizationId: 1,
      studentId: input.studentId,
      category: input.category,
      title: input.title,
      description: input.description ?? null,
      awardDate: input.awardDate,
      issuedBy: input.issuedBy ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
      certificateId: null,
      status: input.status ?? 'approved',
      clientId: input.clientId ?? null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending' as const,
    };
    const id = await this.databaseService.db.awards.add(record as never);
    await this.syncQueueService.enqueue('award', 'create', { ...record, id }, id);
    return { ...record, id };
  }

  update(id: number, input: Partial<AwardInput>): Promise<AwardRecord> {
    return this.api.put<AwardRecord>(`/awards/${id}`, input);
  }

  approve(id: number): Promise<AwardRecord> {
    return this.api.post<AwardRecord>(`/awards/${id}/approve`, {});
  }

  revoke(id: number): Promise<AwardRecord> {
    return this.api.post<AwardRecord>(`/awards/${id}/revoke`, {});
  }

  async recommend(input: AwardInput): Promise<AwardRecord> {
    return this.create({ ...input, status: 'recommended' });
  }

  private async listFromCache(filters: Record<string, string | number | undefined>) {
    let items = await this.databaseService.db.awards.orderBy('awardDate').reverse().toArray();
    if (filters['studentId']) {
      items = items.filter((a) => a.studentId === Number(filters['studentId']));
    }
    if (filters['category']) {
      items = items.filter((a) => a.category === filters['category']);
    }
    return { items, total: items.length };
  }
}
