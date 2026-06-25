import { getNavItemsForRole } from './dashboard-nav.util';

describe('dashboard-nav.util', () => {
  it('returns staff modules for clerk role', () => {
    const items = getNavItemsForRole('clerk');
    const titles = items.map((i) => i.title);
    expect(titles).toContain('Student Dashboard');
    expect(titles).toContain('Expenses');
    expect(titles).toContain('Inventory');
    expect(titles).toContain('Attendance');
    expect(titles).not.toContain('User Management');
  });

  it('returns admin-only modules for admin', () => {
    const items = getNavItemsForRole('admin');
    const titles = items.map((i) => i.title);
    expect(titles).toContain('User Management');
    expect(titles).toContain('Organization Settings');
  });

  it('returns parent portal card when portal enabled', () => {
    const items = getNavItemsForRole('parent', { parentPortalEnabled: true });
    expect(items).toHaveSize(1);
    expect(items[0].title).toBe('Parent Portal');
    expect(items[0].route).toBe('/parent');
  });

  it('returns unavailable card when parent portal disabled', () => {
    const items = getNavItemsForRole('parent', { parentPortalEnabled: false });
    expect(items).toHaveSize(1);
    expect(items[0].title).toBe('Parent Portal Unavailable');
  });

  it('normalizes admission_clerk to clerk modules', () => {
    const clerkItems = getNavItemsForRole('clerk').map((i) => i.title).sort();
    const admissionItems = getNavItemsForRole('admission_clerk').map((i) => i.title).sort();
    expect(admissionItems).toEqual(clerkItems);
  });
});
