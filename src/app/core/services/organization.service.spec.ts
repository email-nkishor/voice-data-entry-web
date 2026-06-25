import { TestBed } from '@angular/core/testing';
import { Organization } from '../models/organization.model';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  const api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'put']);
  const databaseService = {
    db: {
      organizations: {
        put: jasmine.createSpy('put').and.resolveTo(undefined),
      },
    },
  } as unknown as DatabaseService;

  const baseOrg: Organization = {
    id: 1,
    name: 'Test School',
    code: 'TS',
    settings: {
      parentPortalEnabled: true,
      parentAttendanceEnabled: false,
    },
    parentPortalEnabled: true,
    parentAttendanceEnabled: false,
    createdAt: '',
    updatedAt: '',
  };

  function setup(org?: Organization): OrganizationService {
    localStorage.clear();
    if (org) {
      localStorage.setItem('vde_org_current', JSON.stringify(org));
    }
    api.get.calls.reset();
    api.put.calls.reset();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        OrganizationService,
        { provide: ApiService, useValue: api },
        { provide: DatabaseService, useValue: databaseService },
      ],
    });
    return TestBed.inject(OrganizationService);
  }

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('isParentPortalEnabled reads cached org flag', () => {
    const service = setup(baseOrg);
    expect(service.isParentPortalEnabled()).toBe(true);
  });

  it('isParentAttendanceEnabled requires portal and attendance flags', () => {
    const enabled = setup({
      ...baseOrg,
      parentAttendanceEnabled: true,
      settings: { parentPortalEnabled: true, parentAttendanceEnabled: true },
    });
    expect(enabled.isParentAttendanceEnabled()).toBe(true);

    const portalOff = setup({
      ...baseOrg,
      parentPortalEnabled: false,
      settings: { parentPortalEnabled: false, parentAttendanceEnabled: true },
    });
    expect(portalOff.isParentAttendanceEnabled()).toBe(false);
  });

  it('setParentPortalEnabled disables attendance when portal is turned off', async () => {
    api.put.and.resolveTo({
      ...baseOrg,
      parentPortalEnabled: false,
      parentAttendanceEnabled: false,
      settings: { parentPortalEnabled: false, parentAttendanceEnabled: false },
    });
    const service = setup({
      ...baseOrg,
      parentAttendanceEnabled: true,
      settings: { parentPortalEnabled: true, parentAttendanceEnabled: true },
    });
    await service.setParentPortalEnabled(false);
    expect(api.put).toHaveBeenCalledWith('/organizations/current', {
      settings: jasmine.objectContaining({
        parentPortalEnabled: false,
        parentAttendanceEnabled: false,
      }),
    });
  });

  it('setParentAttendanceEnabled forces portal on when enabling attendance', async () => {
    api.put.and.resolveTo({
      ...baseOrg,
      parentAttendanceEnabled: true,
      settings: { parentPortalEnabled: true, parentAttendanceEnabled: true },
    });
    const service = setup(baseOrg);
    await service.setParentAttendanceEnabled(true);
    expect(api.put).toHaveBeenCalledWith('/organizations/current', {
      settings: jasmine.objectContaining({
        parentPortalEnabled: true,
        parentAttendanceEnabled: true,
      }),
    });
  });
});
