import { ageAt, formatBytes, formatDate, isValidISODate } from '@/types/models';
import { shouldLockAfter } from '@/lib/session';

describe('record formatting', () => {
  test('formats small and large files', () => {
    expect(formatBytes(850)).toBe('1 KB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  test('calculates age on the record date', () => {
    expect(ageAt('2026-04-09', '2000-04-10')).toBe(25);
    expect(ageAt('2026-04-10', '2000-04-10')).toBe(26);
    expect(ageAt('1999-01-01', '2000-04-10')).toBeNull();
  });

  test('formats an ISO date for the dossier locale', () => {
    expect(formatDate('2026-10-01')).toContain('2026');
  });

  test('rejects impossible calendar dates', () => {
    expect(isValidISODate('2026-02-28')).toBe(true);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
  });
});

describe('app lock timing', () => {
  test('locks immediately after leaving the app', () => {
    expect(shouldLockAfter('immediate', 0)).toBe(true);
  });

  test('respects delayed lock settings', () => {
    expect(shouldLockAfter('1m', 59_999)).toBe(false);
    expect(shouldLockAfter('1m', 60_000)).toBe(true);
    expect(shouldLockAfter('5m', 299_999)).toBe(false);
    expect(shouldLockAfter('5m', 300_000)).toBe(true);
  });
});
