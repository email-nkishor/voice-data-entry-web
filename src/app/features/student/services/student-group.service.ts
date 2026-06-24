import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { StudentGroup } from '../models/student-group.model';

const DEFAULT_GROUPS: Omit<StudentGroup, 'id'>[] = [
  {
    name: 'General Admission',
    description: 'Default student group',
    createdDate: new Date().toISOString(),
    isDefault: true,
  },
  {
    name: 'MCA Batch 2026',
    description: 'Master of Computer Applications',
    createdDate: new Date().toISOString(),
  },
  {
    name: 'BCA Batch 2026',
    description: 'Bachelor of Computer Applications',
    createdDate: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class StudentGroupService {
  constructor(private databaseService: DatabaseService) {}

  async getAll(): Promise<StudentGroup[]> {
    await this.seedDefaultsIfNeeded();
    return this.databaseService.db.studentGroups.orderBy('name').toArray();
  }

  async add(group: Omit<StudentGroup, 'id'>): Promise<number> {
    return this.databaseService.db.studentGroups.add({
      ...group,
      createdDate: group.createdDate || new Date().toISOString(),
      isDefault: group.isDefault ?? false,
    });
  }

  async delete(id: number): Promise<void> {
    const group = await this.databaseService.db.studentGroups.get(id);
    if (group?.isDefault) {
      throw new Error('Default group cannot be deleted');
    }
    await this.databaseService.db.studentGroups.delete(id);
  }

  private async seedDefaultsIfNeeded(): Promise<void> {
    const count = await this.databaseService.db.studentGroups.count();
    if (count > 0) {
      return;
    }
    for (const group of DEFAULT_GROUPS) {
      await this.databaseService.db.studentGroups.add(group);
    }
  }
}
