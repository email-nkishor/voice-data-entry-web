import { Routes } from '@angular/router';

export const VOICE_HISTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/voice-history-list/voice-history-list.component').then(
        (m) => m.VoiceHistoryListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/voice-history-detail/voice-history-detail.component').then(
        (m) => m.VoiceHistoryDetailComponent
      ),
  },
];
