import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<Expense[]> {
    return this.databaseService.db.expenses
      .orderBy('expenseDate')
      .reverse()
      .toArray();
  }

  async add(expense: Expense): Promise<void> {
    const record = { ...expense, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.expenses.add(record);
    await this.syncQueueService.enqueue('expense', 'create', { ...record, id });
  }
}
