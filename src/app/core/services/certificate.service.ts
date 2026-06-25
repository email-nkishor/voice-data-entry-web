import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { SyncQueueService } from './sync-queue.service';
import {
  CertificateInput,
  CertificateRecord,
  CertificateTemplate,
} from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  list(filters: Record<string, string | number | undefined> = {}): Promise<{ items: CertificateRecord[]; total: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return this.api
      .get<{ items: CertificateRecord[]; total: number }>(`/certificates${qs ? `?${qs}` : ''}`)
      .then(async (res) => {
        for (const item of res.items) {
          await this.databaseService.db.certificates.put({ ...item, syncStatus: 'synced' });
        }
        return res;
      })
      .catch(() => this.listFromCache(filters));
  }

  getById(id: number): Promise<CertificateRecord | undefined> {
    return this.api
      .get<CertificateRecord>(`/certificates/${id}`)
      .then(async (item) => {
        await this.databaseService.db.certificates.put({ ...item, syncStatus: 'synced' });
        return item;
      })
      .catch(() => this.databaseService.db.certificates.get(id));
  }

  getForStudent(studentId: number, limit = 20): Promise<CertificateRecord[]> {
    return this.api
      .get<CertificateRecord[]>(`/certificates/student/${studentId}?limit=${limit}`)
      .catch(() =>
        this.databaseService.db.certificates
          .where('studentId')
          .equals(studentId)
          .reverse()
          .limit(limit)
          .toArray()
      );
  }

  getStats(): Promise<{ total: number; byStatus: Record<string, number>; byType: Record<string, number> }> {
    return this.api.get('/certificates/stats');
  }

  verify(code: string): Promise<{ valid: boolean; message: string; certificate?: CertificateRecord }> {
    return this.api.get(`/certificates/verify/${encodeURIComponent(code)}`);
  }

  listTemplates(includeInactive = false): Promise<CertificateTemplate[]> {
    return this.api.get<CertificateTemplate[]>(
      `/certificate-templates?includeInactive=${includeInactive}`
    );
  }

  create(input: CertificateInput): Promise<CertificateRecord> {
    return this.api.post<CertificateRecord>('/certificates', input).then(async (created) => {
      await this.databaseService.db.certificates.put({ ...created, syncStatus: 'synced' });
      return created;
    });
  }

  update(id: number, input: Partial<CertificateInput>): Promise<CertificateRecord> {
    return this.api.put<CertificateRecord>(`/certificates/${id}`, input).then(async (updated) => {
      await this.databaseService.db.certificates.put({ ...updated, syncStatus: 'synced' });
      return updated;
    });
  }

  revoke(id: number, reason: string): Promise<CertificateRecord> {
    return this.api.post<CertificateRecord>(`/certificates/${id}/revoke`, { reason });
  }

  async createOffline(input: CertificateInput): Promise<CertificateRecord> {
    const clientId = input.clientId ?? Date.now();
    const now = new Date().toISOString();
    const local: CertificateRecord = {
      id: clientId,
      organizationId: 1,
      studentId: input.studentId,
      templateId: input.templateId ?? null,
      certificateNumber: `LOCAL-${clientId}`,
      certificateType: input.certificateType ?? 'achievement',
      title: input.title,
      description: input.description ?? null,
      issueDate: input.issueDate,
      issuedBy: input.issuedBy,
      attachmentUrl: input.attachmentUrl ?? null,
      verificationCode: null,
      status: input.status ?? 'issued',
      clientId,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };
    await this.databaseService.db.certificates.put(local);
    await this.syncQueueService.enqueue('certificate', 'create', { ...input, clientId }, clientId);
    return local;
  }

  private async listFromCache(filters: Record<string, string | number | undefined>) {
    let items = await this.databaseService.db.certificates.orderBy('issueDate').reverse().toArray();
    if (filters['studentId']) {
      items = items.filter((c) => c.studentId === Number(filters['studentId']));
    }
    if (filters['status']) {
      items = items.filter((c) => c.status === filters['status']);
    }
    return { items, total: items.length };
  }
}
