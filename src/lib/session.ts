import * as SecureStore from 'expo-secure-store';

const onboardingKey = 'health-dossier.onboarding-complete';
const appLockEnabledKey = 'health-dossier.app-lock-enabled';
const appLockTimeoutKey = 'health-dossier.app-lock-timeout';

export type AppLockTimeout = 'immediate' | '1m' | '5m';

export const appLockTimeouts: { value: AppLockTimeout; label: string; milliseconds: number }[] = [
  { value: 'immediate', label: 'Immediately', milliseconds: 0 },
  { value: '1m', label: 'After 1 minute', milliseconds: 60_000 },
  { value: '5m', label: 'After 5 minutes', milliseconds: 300_000 },
];

export async function hasCompletedOnboarding() {
  return (await SecureStore.getItemAsync(onboardingKey)) === 'true';
}

export async function completeOnboarding() {
  await SecureStore.setItemAsync(onboardingKey, 'true');
}

export async function clearOnboarding() {
  await SecureStore.deleteItemAsync(onboardingKey);
}

export async function getAppLockPreferences() {
  const [enabled, savedTimeout] = await Promise.all([
    SecureStore.getItemAsync(appLockEnabledKey),
    SecureStore.getItemAsync(appLockTimeoutKey),
  ]);
  const timeout = appLockTimeouts.some(option => option.value === savedTimeout)
    ? savedTimeout as AppLockTimeout
    : 'immediate';
  return { enabled: enabled === 'true', timeout };
}

export async function setAppLockEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(appLockEnabledKey, String(enabled));
}

export async function setAppLockTimeout(timeout: AppLockTimeout) {
  await SecureStore.setItemAsync(appLockTimeoutKey, timeout);
}

export function shouldLockAfter(timeout: AppLockTimeout, elapsedMilliseconds: number) {
  const delay = appLockTimeouts.find(option => option.value === timeout)?.milliseconds ?? 0;
  return elapsedMilliseconds >= delay;
}
