import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModuleActionHeaderComponent } from '../../../../shared/components/module-action-header/module-action-header.component';
import { Survey } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [RouterLink, ModuleActionHeaderComponent],
  template: `
    <div class="page">
      <app-module-action-header title="Surveys" backLink="/dashboard" />
      <div class="toolbar"><a routerLink="/survey/entry" class="btn btn-primary">New Survey Entry</a></div>
      <div class="list">
        @for (survey of surveys; track survey.id) {
          <article class="card list-item">
            <h3>{{ survey.respondentName }}</h3>
            <p>Mobile: {{ survey.mobile }}</p>
            <p>Date: {{ survey.surveyDate }}</p>
            <p>{{ survey.feedback }}</p>
          </article>
        } @empty { <p class="empty">No survey responses.</p> }
      </div>
    </div>
  `,
})
export class SurveyListComponent implements OnInit {
  surveys: Survey[] = [];
  constructor(private surveyService: SurveyService) {}
  async ngOnInit(): Promise<void> { this.surveys = await this.surveyService.getAll(); }
}
