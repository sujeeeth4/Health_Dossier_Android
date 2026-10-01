import * as SecureStore from 'expo-secure-store';

const onboardingKey = 'health-dossier.onboarding-complete';

export async function hasCompletedOnboarding() {
  return (await SecureStore.getItemAsync(onboardingKey)) === 'true';
}

export async function completeOnboarding() {
  await SecureStore.setItemAsync(onboardingKey, 'true');
}

export async function clearOnboarding() {
  await SecureStore.deleteItemAsync(onboardingKey);
}
