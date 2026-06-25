import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { SyncQueueService } from './sync-queue.service';
import {
  CustomFieldDefinition,
  CustomFieldDefinitionInput,
  CustomFieldValueInput,
  CustomFieldValueRecord,
} from '../models/custom-field.model';

@Injectable({ providedIn: 'root' })
export class CustomFieldService {
  constructor(
    private api: ApiService,
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async listDefinitions(
    entityType = 'student',
    includeInactive = false,
    preferCache = false
  ): Promise<CustomFieldDefinition[]> {
    if (!preferCache) {
      try {
        const defs = await this.api.get<CustomFieldDefinition[]>(
          `/custom-fields/definitions?entityType=${entityType}&includeInactive=${includeInactive}`
        );
        await this.cacheDefinitions(defs);
        return defs.filter((d) => includeInactive || d.isActive);
      } catch {
        // fall through to cache
      }
    }
    const cached = await this.databaseService.db.customFieldDefinitions
      .where('entityType')
      .equals(entityType)
      .toArray();
    return cached
      .filter((d) => includeInactive || d.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createDefinition(input: CustomFieldDefinitionInput): Promise<CustomFieldDefinition> {
    const created = await this.api.post<CustomFieldDefinition>('/custom-fields/definitions', input);
    await this.databaseService.db.customFieldDefinitions.put(created);
    return created;
  }

  async updateDefinition(
    id: number,
    input: Partial<CustomFieldDefinitionInput>
  ): Promise<CustomFieldDefinition> {
    const updated = await this.api.put<CustomFieldDefinition>(`/custom-fields/definitions/${id}`, input);
    await this.databaseService.db.customFieldDefinitions.put(updated);
    return updated;
  }

  async deactivateDefinition(id: number): Promise<void> {
    await this.api.delete(`/custom-fields/definitions/${id}`);
    const existing = await this.databaseService.db.customFieldDefinitions.get(id);
    if (existing) {
      await this.databaseService.db.customFieldDefinitions.put({ ...existing, isActive: false });
    }
  }

  async reorderDefinitions(orderedIds: number[], entityType = 'student'): Promise<CustomFieldDefinition[]> {
    const defs = await this.api.post<CustomFieldDefinition[]>('/custom-fields/definitions/reorder', {
      orderedIds,
      entityType,
    });
    await this.cacheDefinitions(defs);
    return defs;
  }

  async getEntityValues(entityType: string, entityId: number): Promise<CustomFieldValueRecord[]> {
    try {
      const values = await this.api.get<CustomFieldValueRecord[]>(
        `/custom-fields/values/${entityType}/${entityId}`
      );
      for (const val of values) {
        await this.databaseService.db.customFieldValues.put({
          ...val,
          entityType,
          entityId,
          syncStatus: 'synced',
        });
      }
      return values;
    } catch {
      return this.databaseService.db.customFieldValues
        .where({ entityType, entityId })
        .toArray();
    }
  }

  async getValuesMap(entityType: string, entityId: number): Promise<Record<string, unknown>> {
    const values = await this.getEntityValues(entityType, entityId);
    const map: Record<string, unknown> = {};
    for (const val of values) {
      if (val.fieldName) {
        map[val.fieldName] = val.value;
      }
    }
    return map;
  }

  buildDefaultValues(definitions: CustomFieldDefinition[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const def of definitions) {
      if (def.defaultValue !== null && def.defaultValue !== undefined && def.defaultValue !== '') {
        values[def.fieldName] = this.parseDefault(def);
      } else if (def.fieldType === 'boolean') {
        values[def.fieldName] = false;
      } else if (def.fieldType === 'multiselect') {
        values[def.fieldName] = [];
      } else {
        values[def.fieldName] = '';
      }
    }
    return values;
  }

  mergeValues(
    definitions: CustomFieldDefinition[],
    existing: Record<string, unknown>
  ): Record<string, unknown> {
    const defaults = this.buildDefaultValues(definitions);
    return { ...defaults, ...existing };
  }

  toValueInputs(
    definitions: CustomFieldDefinition[],
    values: Record<string, unknown>
  ): CustomFieldValueInput[] {
    return definitions.map((def) => ({
      fieldDefinitionId: def.id,
      fieldName: def.fieldName,
      value: this.serializeValue(values[def.fieldName], def.fieldType),
    }));
  }

  async validate(
    entityType: string,
    values: CustomFieldValueInput[]
  ): Promise<{ valid: boolean; errors: Record<string, string> }> {
    try {
      return await this.api.post<{ valid: boolean; errors: Record<string, string> }>(
        '/custom-fields/validate',
        { entityType, values }
      );
    } catch {
      return { valid: true, errors: {} };
    }
  }

  async saveEntityValues(
    entityType: string,
    entityId: number,
    definitions: CustomFieldDefinition[],
    values: Record<string, unknown>,
    serverEntityId?: number
  ): Promise<void> {
    const inputs = this.toValueInputs(definitions, values);
    const targetId = serverEntityId ?? entityId;

    for (const def of definitions) {
      const val = values[def.fieldName];
      await this.databaseService.db.customFieldValues.put({
        fieldDefinitionId: def.id,
        fieldName: def.fieldName,
        entityType,
        entityId,
        value: val,
        rawValue: this.rawString(val, def.fieldType),
        syncStatus: 'pending',
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      await this.api.put(`/custom-fields/values/${entityType}/${targetId}`, { values: inputs });
      const stored = await this.databaseService.db.customFieldValues
        .where({ entityType, entityId })
        .toArray();
      for (const row of stored) {
        if (row.id) {
          await this.databaseService.db.customFieldValues.update(row.id, { syncStatus: 'synced' });
        }
      }
    } catch {
      await this.syncQueueService.enqueue('customFieldValue', 'update', {
        entityType,
        entityId: targetId,
        values: inputs,
      });
    }
  }

  validateLocal(
    definitions: CustomFieldDefinition[],
    values: Record<string, unknown>
  ): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const def of definitions) {
      const val = values[def.fieldName];
      const empty =
        val === null ||
        val === undefined ||
        val === '' ||
        (Array.isArray(val) && val.length === 0);

      if (def.isRequired && empty) {
        errors[def.fieldName] = `${def.fieldLabel} is required`;
        continue;
      }
      if (empty) {
        continue;
      }

      const rules = def.validationRules ?? {};
      if (def.fieldType === 'text') {
        const str = String(val);
        if (rules.minLength !== undefined && str.length < rules.minLength) {
          errors[def.fieldName] = `Minimum ${rules.minLength} characters`;
        }
        if (rules.maxLength !== undefined && str.length > rules.maxLength) {
          errors[def.fieldName] = `Maximum ${rules.maxLength} characters`;
        }
      }
      if (def.fieldType === 'number') {
        const num = Number(val);
        if (Number.isNaN(num)) {
          errors[def.fieldName] = 'Must be a number';
        } else {
          if (rules.min !== undefined && num < rules.min) {
            errors[def.fieldName] = `Minimum value is ${rules.min}`;
          }
          if (rules.max !== undefined && num > rules.max) {
            errors[def.fieldName] = `Maximum value is ${rules.max}`;
          }
        }
      }
    }
    return errors;
  }

  private async cacheDefinitions(defs: CustomFieldDefinition[]): Promise<void> {
    for (const def of defs) {
      await this.databaseService.db.customFieldDefinitions.put(def);
    }
  }

  private parseDefault(def: CustomFieldDefinition): unknown {
    if (def.fieldType === 'boolean') {
      return def.defaultValue === 'true';
    }
    if (def.fieldType === 'multiselect') {
      try {
        return JSON.parse(def.defaultValue ?? '[]');
      } catch {
        return [];
      }
    }
    if (def.fieldType === 'number') {
      return Number(def.defaultValue);
    }
    return def.defaultValue ?? '';
  }

  private serializeValue(
    value: unknown,
    fieldType: CustomFieldDefinition['fieldType']
  ): CustomFieldValueInput['value'] {
    if (value === null || value === undefined) {
      return null;
    }
    if (fieldType === 'multiselect') {
      return Array.isArray(value) ? value.map(String) : String(value).split(',').map((s) => s.trim());
    }
    if (fieldType === 'boolean') {
      return value === true || value === 'true';
    }
    if (fieldType === 'number') {
      return Number(value);
    }
    return String(value);
  }

  private rawString(value: unknown, fieldType: CustomFieldDefinition['fieldType']): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (fieldType === 'multiselect') {
      return JSON.stringify(Array.isArray(value) ? value : [value]);
    }
    if (fieldType === 'boolean') {
      return value === true || value === 'true' ? 'true' : 'false';
    }
    return String(value);
  }
}
