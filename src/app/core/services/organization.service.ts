import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Organization } from '../models/organization.model';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

const ORG_CACHE_KEY = 'vde_org_current';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly orgSubject = new BehaviorSubject<Organization | null>(this.loadCached());
  readonly organization$ = this.orgSubject.asObservable();

  constructor(
    private api: ApiService,
    private databaseService: DatabaseService
  ) {}

  get current(): Organization | null {
    return this.orgSubject.value;
  }

  isParentPortalEnabled(): boolean {
    return this.current?.parentPortalEnabled === true;
  }

  isParentAttendanceEnabled(): boolean {
    return (
      this.isParentPortalEnabled() &&
      (this.current?.parentAttendanceEnabled === true ||
        this.current?.settings?.parentAttendanceEnabled === true)
    );
  }

  async loadCurrent(): Promise<Organization> {
    try {
      const org = await this.api.get<Organization>('/organizations/current');
      await this.cache(org);
      this.orgSubject.next(org);
      return org;
    } catch {
      const cached = this.loadCached();
      if (cached) {
        return cached;
      }
      throw new Error('Organization not available');
    }
  }

  async updateSettings(settings: Record<string, unknown>): Promise<Organization> {
    const org = await this.api.put<Organization>('/organizations/current', { settings });
    await this.cache(org);
    this.orgSubject.next(org);
    return org;
  }

  async setParentPortalEnabled(enabled: boolean): Promise<Organization> {
    const current = this.current ?? (await this.loadCurrent());
    return this.updateSettings({
      ...current.settings,
      parentPortalEnabled: enabled,
      parentAttendanceEnabled: enabled ? current.settings.parentAttendanceEnabled : false,
    });
  }

  async setParentAttendanceEnabled(enabled: boolean): Promise<Organization> {
    const current = this.current ?? (await this.loadCurrent());
    return this.updateSettings({
      ...current.settings,
      parentPortalEnabled: enabled ? true : current.settings.parentPortalEnabled,
      parentAttendanceEnabled: enabled,
    });
  }

  private async cache(org: Organization): Promise<void> {
    localStorage.setItem(ORG_CACHE_KEY, JSON.stringify(org));
    await this.databaseService.db.organizations.put({
      id: String(org.id),
      data: org,
      cachedAt: new Date().toISOString(),
    });
  }

  private loadCached(): Organization | null {
    const raw = localStorage.getItem(ORG_CACHE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Organization;
    } catch {
      return null;
    }
  }
}
