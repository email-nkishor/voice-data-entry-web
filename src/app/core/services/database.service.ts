import { Injectable } from '@angular/core';
import { appDatabase } from '../database/app.database';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  readonly db = appDatabase;

  async init(): Promise<void> {
    await this.db.open();
  }
}
