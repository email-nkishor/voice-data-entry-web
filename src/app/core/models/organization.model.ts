export interface OrganizationSettings {
  timezone?: string;
  academicYear?: string;
  parentPortalEnabled?: boolean;
  parentAttendanceEnabled?: boolean;
}

export interface Organization {
  id: number;
  name: string;
  code: string;
  settings: OrganizationSettings;
  parentPortalEnabled: boolean;
  parentAttendanceEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}
