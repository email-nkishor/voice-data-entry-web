import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DatabaseService } from './core/services/database.service';
import { SyncService } from './core/services/sync.service';

function initializeDatabase(databaseService: DatabaseService) {
  return () => databaseService.init();
}

function initializeSync(syncService: SyncService) {
  return () => {
    void syncService.refreshPendingCount();
    void syncService.checkApiOnline();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDatabase,
      deps: [DatabaseService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSync,
      deps: [SyncService],
      multi: true,
    },
  ],
};
