import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SyncService, SyncState } from '../../../core/services/sync.service';
import { ToastService } from '../../../core/services/toast.service';
import { SyncBarComponent } from './sync-bar.component';

describe('SyncBarComponent', () => {
  let component: SyncBarComponent;
  let fixture: ComponentFixture<SyncBarComponent>;

  const stateSubject = new BehaviorSubject<SyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    pendingCount: 0,
    lastError: null,
    apiOnline: true,
  });

  const syncService = jasmine.createSpyObj<SyncService>(
    'SyncService',
    ['refreshPendingCount', 'checkApiOnline', 'syncAll'],
    { state$: stateSubject.asObservable(), state: stateSubject.value }
  );
  const toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']);

  beforeEach(async () => {
    syncService.refreshPendingCount.and.resolveTo(0);
    syncService.checkApiOnline.and.resolveTo(true);
    syncService.syncAll.and.resolveTo({ synced: 1, failed: 0 });

    await TestBed.configureTestingModule({
      imports: [SyncBarComponent],
      providers: [
        { provide: SyncService, useValue: syncService },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formatRelative returns human-readable deltas', () => {
    const now = new Date().toISOString();
    expect(component.formatRelative(now)).toBe('just now');

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(component.formatRelative(fiveMinAgo)).toBe('5m ago');

    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString();
    expect(component.formatRelative(twoHoursAgo)).toBe('2h ago');
  });

  it('syncNow calls sync service and shows toast', async () => {
    await component.syncNow();
    expect(syncService.syncAll).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});
