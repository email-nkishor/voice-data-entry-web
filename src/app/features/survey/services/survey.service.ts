import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { Survey } from '../models/survey.model';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<Survey[]> {
    return this.databaseService.db.surveys
      .orderBy('surveyDate')
      .reverse()
      .toArray();
  }

  async add(survey: Survey): Promise<void> {
    const record = { ...survey, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.surveys.add(record);
    await this.syncQueueService.enqueue('survey', 'create', { ...record, id });
  }
}
