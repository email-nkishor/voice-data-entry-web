import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  template: `
    <div class="page">
      <app-module-action-header title="Hospital Registration" backLink="/dashboard" />
      <div class="toolbar"><a routerLink="/patient/add" class="btn btn-primary">+ Register Patient</a></div>
      <div class="list">
        @for (patient of patients; track patient.id) {
          <article class="card list-item">
            <h3>{{ patient.patientName }}</h3>
            <p>Age: {{ patient.age }} | {{ patient.gender }}</p>
            <p>Mobile: {{ patient.mobile }}</p>
            <p>{{ patient.address }}</p>
          </article>
        } @empty { <p class="empty">No patients registered.</p> }
      </div>
    </div>
  `,
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  constructor(private patientService: PatientService) {}
  async ngOnInit(): Promise<void> { this.patients = await this.patientService.getAll(); }
}
