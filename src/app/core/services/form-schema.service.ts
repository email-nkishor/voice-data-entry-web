import { Injectable } from '@angular/core';
import {
  DynamicColumn,
  FormColumnRecord,
} from '../models/dynamic-column.model';
import {
  MODULE_COLUMN_DEFAULTS,
  ModuleCode,
} from '../config/module-column-defaults';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class FormSchemaService {
  constructor(private databaseService: DatabaseService) {}

  async getColumns(moduleCode: string): Promise<DynamicColumn[]> {
    await this.seedDefaultsIfNeeded(moduleCode);

    const rows = await this.databaseService.db.formColumns
      .where('moduleCode')
      .equals(moduleCode)
      .sortBy('sortOrder');

    return rows.map((row) => this.mapRow(row));
  }

  async addColumn(
    moduleCode: string,
    column: Omit<DynamicColumn, 'id' | 'moduleCode'>
  ): Promise<void> {
    const existing = await this.databaseService.db.formColumns
      .where('moduleCode')
      .equals(moduleCode)
      .toArray();
    const maxOrder = existing.reduce(
      (max, row) => Math.max(max, row.sortOrder),
      -1
    );
    const sortOrder = column.sortOrder ?? maxOrder + 1;

    await this.databaseService.db.formColumns.add({
      moduleCode,
      columnKey: column.columnKey,
      label: column.label,
      speechKeywords: JSON.stringify(column.speechKeywords),
      fieldType: column.fieldType,
      sortOrder,
      isLeadingField: column.isLeadingField ? 1 : 0,
      isSystemField: column.isSystemField ? 1 : 0,
      allowDelete: column.allowDelete === false ? 0 : 1,
      allowVoiceEdit: column.allowVoiceEdit === false ? 0 : 1,
    });
  }

  async updateColumn(
    id: number,
    updates: Partial<
      Pick<DynamicColumn, 'label' | 'speechKeywords' | 'fieldType'>
    >
  ): Promise<void> {
    const existing = await this.databaseService.db.formColumns.get(id);
    if (!existing) {
      return;
    }

    await this.databaseService.db.formColumns.update(id, {
      label: updates.label ?? existing.label,
      speechKeywords: updates.speechKeywords
        ? JSON.stringify(updates.speechKeywords)
        : existing.speechKeywords,
      fieldType: updates.fieldType ?? existing.fieldType,
    });
  }

  async deleteColumn(id: number): Promise<void> {
    const existing = await this.databaseService.db.formColumns.get(id);
    if (!existing) {
      throw new Error('This column cannot be removed');
    }

    const column = this.mapRow(existing);
    if (!this.canDeleteColumn(column)) {
      throw new Error('This column cannot be removed');
    }

    await this.databaseService.db.formColumns.delete(id);
  }

  canDeleteColumn(column: DynamicColumn): boolean {
    return column.allowDelete !== false && !column.isSystemField;
  }

  canEditVoice(column: DynamicColumn): boolean {
    return column.allowVoiceEdit !== false;
  }

  private async seedDefaultsIfNeeded(moduleCode: string): Promise<void> {
    const count = await this.databaseService.db.formColumns
      .where('moduleCode')
      .equals(moduleCode)
      .count();

    if (count > 0) {
      return;
    }

    const defaults = MODULE_COLUMN_DEFAULTS[moduleCode as ModuleCode];
    if (!defaults) {
      return;
    }

    for (const column of defaults) {
      await this.databaseService.db.formColumns.add({
        moduleCode,
        columnKey: column.columnKey,
        label: column.label,
        speechKeywords: JSON.stringify(column.speechKeywords),
        fieldType: column.fieldType,
        sortOrder: column.sortOrder,
        isLeadingField: column.isLeadingField ? 1 : 0,
        isSystemField: column.isSystemField ? 1 : 0,
        allowDelete: column.allowDelete === false ? 0 : 1,
        allowVoiceEdit: column.allowVoiceEdit === false ? 0 : 1,
      });
    }
  }

  private mapRow(row: FormColumnRecord): DynamicColumn {
    let speechKeywords: string[] = [];

    try {
      speechKeywords = JSON.parse(row.speechKeywords);
    } catch {
      speechKeywords = row.speechKeywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    }

    const defaultColumn = MODULE_COLUMN_DEFAULTS[
      row.moduleCode as ModuleCode
    ]?.find((column) => column.columnKey === row.columnKey);

    const isSystemField =
      row.isSystemField === 1 || defaultColumn?.isSystemField === true;
    const allowDelete =
      row.allowDelete !== undefined
        ? row.allowDelete !== 0
        : defaultColumn?.allowDelete !== false && !isSystemField;
    const allowVoiceEdit =
      row.allowVoiceEdit !== undefined
        ? row.allowVoiceEdit !== 0
        : defaultColumn?.allowVoiceEdit !== false;

    const fieldType =
      defaultColumn?.fieldType && isSystemField
        ? defaultColumn.fieldType
        : (row.fieldType as DynamicColumn['fieldType']);

    return {
      id: row.id,
      moduleCode: row.moduleCode,
      columnKey: row.columnKey,
      label: row.label,
      speechKeywords,
      fieldType,
      sortOrder: row.sortOrder,
      isLeadingField: row.isLeadingField === 1,
      isSystemField,
      allowDelete,
      allowVoiceEdit,
      lookupKey: defaultColumn?.lookupKey,
    };
  }
}
