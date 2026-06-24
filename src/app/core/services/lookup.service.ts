import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { STUDENT_STATUS_LABELS } from '../../features/student/models/student.model';

export interface LookupOption {
  value: string;
  label: string;
}

export type LookupCategory = 'class' | 'grade' | 'section' | 'status' | 'feeStatus';

export type LookupMap = Partial<Record<LookupCategory, LookupOption[]>>;

const OFFLINE_FALLBACKS: LookupMap = {
  class: [
    { value: 'Class 10', label: 'Class 10' },
    { value: 'Class 12', label: 'Class 12' },
    { value: 'B.Tech', label: 'B.Tech' },
    { value: 'MCA', label: 'MCA' },
  ],
  grade: [
    { value: 'A+', label: 'A+' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ],
  section: [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
  ],
  status: Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
  feeStatus: [
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'not_applicable', label: 'Not Applicable' },
  ],
};

@Injectable({ providedIn: 'root' })
export class LookupService {
  private cache: LookupMap | null = null;
  private loadPromise: Promise<LookupMap> | null = null;

  constructor(private apiService: ApiService) {}

  async loadLookups(force = false): Promise<LookupMap> {
    if (this.cache && !force) {
      return this.cache;
    }

    if (this.loadPromise && !force) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchLookups();
    this.cache = await this.loadPromise;
    this.loadPromise = null;
    return this.cache;
  }

  getOptions(lookupKey: string): LookupOption[] {
    const key = lookupKey as LookupCategory;
    return this.cache?.[key] ?? OFFLINE_FALLBACKS[key] ?? [];
  }

  getLabel(lookupKey: string, value: string): string {
    if (!value) {
      return '';
    }

    const options = this.getOptions(lookupKey);
    const match = options.find(
      (option) => option.value.toLowerCase() === value.toLowerCase()
    );
    return match?.label ?? value;
  }

  private async fetchLookups(): Promise<LookupMap> {
    try {
      const data = await this.apiService.get<LookupMap>('/lookups');
      return { ...OFFLINE_FALLBACKS, ...data };
    } catch {
      return { ...OFFLINE_FALLBACKS };
    }
  }
}
