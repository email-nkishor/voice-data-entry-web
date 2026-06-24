import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { InventoryItem } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<InventoryItem[]> {
    return this.databaseService.db.inventory
      .orderBy('purchaseDate')
      .reverse()
      .toArray();
  }

  async add(item: InventoryItem): Promise<void> {
    const record = { ...item, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.inventory.add(record);
    await this.syncQueueService.enqueue('inventory', 'create', { ...record, id });
  }
}
