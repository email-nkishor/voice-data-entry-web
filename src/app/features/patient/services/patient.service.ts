import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncQueueService } from '../../../core/services/sync-queue.service';
import { Patient, PatientGender } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(
    private databaseService: DatabaseService,
    private syncQueueService: SyncQueueService
  ) {}

  async getAll(): Promise<Patient[]> {
    return this.databaseService.db.patients.orderBy('patientName').toArray();
  }

  async add(patient: Patient): Promise<void> {
    const record = { ...patient, syncStatus: 'pending' as const };
    const id = await this.databaseService.db.patients.add(record);
    await this.syncQueueService.enqueue('patient', 'create', { ...record, id });
  }

  getGenderOptions(): PatientGender[] {
    return ['Male', 'Female', 'Other'];
  }
}
