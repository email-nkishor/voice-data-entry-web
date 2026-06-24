import { Injectable } from '@angular/core';
import {
  SyncEntity,
  SyncOperation,
  SyncQueueItem,
} from '../models/sync-queue.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class SyncQueueService {
  constructor(private databaseService: DatabaseService) {}

  async enqueue(
    entity: SyncEntity,
    operation: SyncOperation,
    payload: unknown,
    entityId?: number
  ): Promise<void> {
    const item: SyncQueueItem = {
      entity,
      entityId,
      operation,
      payload: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await this.databaseService.db.syncQueue.add(item);
  }

  async getPending(): Promise<SyncQueueItem[]> {
    return this.databaseService.db.syncQueue
      .filter((item) => !item.synced)
      .toArray();
  }
}
