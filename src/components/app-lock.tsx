import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Button } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import {
  AppLockTimeout,
  getAppLockPreferences,
  setAppLockEnabled,
  setAppLockTimeout,
  shouldLockAfter,
} from '@/lib/session';

type AuthenticationResult = { success: true } | { success: false; message: string };

type AppLockContextValue = {
  enabled: boolean;
  timeout: AppLockTimeout;
  biometricAvailable: boolean | null;
  enable: () => Promise<AuthenticationResult>;
  disable: () => Promise<AuthenticationResult>;
  updateTimeout: (timeout: AppLockTimeout) => Promise<void>;
  lockNow: () => void;
};

const AppLockContext = createContext<AppLockContextValue | null>(null);

const errorMessages: Partial<Record<LocalAuthentication.LocalAuthenticationError, string>> = {
  not_available: 'Biometric authentication is not available on this device.',
  not_enrolled: 'Add a strong fingerprint or face unlock in Android Settings first.',
  lockout: 'Biometric authentication is temporarily locked. Use your device credential or try again later.',
  passcode_not_set: 'Set a screen lock on this device before protecting your dossier.',
  user_cancel: 'Authentication was cancelled.',
  system_cancel: 'Authentication was interrupted. Please try again.',
};

async function authenticate(promptMessage: string): Promise<AuthenticationResult> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptDescription: 'Unlock your private health records',
    cancelLabel: 'Cancel',
    biometricsSecurityLevel: 'strong',
    disableDeviceFallback: false,
  });
  if (result.success) return { success: true };
  return { success: false, message: errorMessages[result.error] ?? 'Authentication failed. Please try again.' };
}

async function hasStrongBiometric() {
  const [hasHardware, level] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
  ]);
  return hasHardware && level >= LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;
}

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [timeout, setTimeoutValue] = useState<AppLockTimeout>('immediate');
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [message, setMessage] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundAt = useRef<number | null>(null);
  const authenticationInProgress = useRef(false);
  const enabledRef = useRef(false);
  const timeoutRef = useRef<AppLockTimeout>('immediate');

  const checkAvailability = useCallback(async () => {
    try {
      const available = await hasStrongBiometric();
      setBiometricAvailable(available);
      return available;
    } catch {
      setBiometricAvailable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    Promise.all([getAppLockPreferences(), hasStrongBiometric().catch(() => false)])
      .then(([preferences, available]) => {
        enabledRef.current = preferences.enabled;
        timeoutRef.current = preferences.timeout;
        setEnabled(preferences.enabled);
        setTimeoutValue(preferences.timeout);
        setLocked(preferences.enabled);
        setBiometricAvailable(available);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      const wasActive = appState.current === 'active';
      appState.current = nextState;
      if (nextState !== 'active') {
        if (wasActive && !authenticationInProgress.current) backgroundAt.current = Date.now();
        setHidden(true);
        return;
      }

      setHidden(false);
      if (authenticationInProgress.current || !enabledRef.current || backgroundAt.current === null) return;
      const elapsed = Date.now() - backgroundAt.current;
      backgroundAt.current = null;
      if (shouldLockAfter(timeoutRef.current, elapsed)) setLocked(true);
    };
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);

  const runAuthentication = useCallback(async (promptMessage: string) => {
    authenticationInProgress.current = true;
    setAuthenticating(true);
    setMessage('');
    try {
      return await authenticate(promptMessage);
    } catch {
      return { success: false, message: 'Authentication could not start. Please try again.' } as AuthenticationResult;
    } finally {
      authenticationInProgress.current = false;
      backgroundAt.current = null;
      setAuthenticating(false);
      setHidden(false);
    }
  }, []);

  const unlock = useCallback(async () => {
    const result = await runAuthentication('Unlock Health Dossier');
    if (result.success) {
      setLocked(false);
      setMessage('');
    } else {
      setMessage(result.message);
      if (result.message.includes('Android Settings')) checkAvailability();
    }
  }, [checkAvailability, runAuthentication]);

  useEffect(() => {
    if (!ready || !locked) return;
    const prompt = setTimeout(unlock, 0);
    return () => clearTimeout(prompt);
  }, [locked, ready, unlock]);

  const enable = useCallback(async () => {
    await checkAvailability();
    const result = await runAuthentication('Protect Health Dossier');
    if (!result.success) return result;
    await setAppLockEnabled(true);
    enabledRef.current = true;
    setEnabled(true);
    return result;
  }, [checkAvailability, runAuthentication]);

  const disable = useCallback(async () => {
    const result = await runAuthentication('Turn off dossier protection');
    if (!result.success) return result;
    await setAppLockEnabled(false);
    enabledRef.current = false;
    setEnabled(false);
    setLocked(false);
    return result;
  }, [runAuthentication]);

  const updateTimeout = useCallback(async (value: AppLockTimeout) => {
    await setAppLockTimeout(value);
    timeoutRef.current = value;
    setTimeoutValue(value);
  }, []);

  const lockNow = useCallback(() => {
    if (enabledRef.current) setLocked(true);
  }, []);

  if (!ready) return <PrivacyCover/>;

  return <AppLockContext.Provider value={{ enabled, timeout, biometricAvailable, enable, disable, updateTimeout, lockNow }}>
    <View style={styles.container}>
      {children}
      {hidden ? <PrivacyCover/> : locked ? <LockScreen message={message} authenticating={authenticating} onUnlock={unlock}/> : null}
    </View>
  </AppLockContext.Provider>;
}

export function useAppLock() {
  const value = useContext(AppLockContext);
  if (!value) throw new Error('useAppLock must be used inside AppLockProvider');
  return value;
}

function PrivacyCover() {
  return <View style={styles.cover}><Brand compact/></View>;
}

function LockScreen({ message, authenticating, onUnlock }: { message: string; authenticating: boolean; onUnlock: () => void }) {
  return <SafeAreaView style={styles.screen}>
    <View style={styles.lockCard}>
      <Brand/>
      <View style={styles.icon}><Ionicons name="lock-closed" size={34} color={colors.green}/></View>
      <Text style={styles.title}>Your dossier is locked</Text>
      <Text style={styles.body}>Authenticate with your device to view your private health records.</Text>
      {message ? <Text style={styles.error}>{message}</Text> : null}
      <Button title="Unlock dossier" icon="finger-print-outline" loading={authenticating} onPress={onUnlock} style={styles.button}/>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { position: 'absolute', inset: 0, zIndex: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  screen: { position: 'absolute', inset: 0, zIndex: 100, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lockCard: { width: '100%', maxWidth: 420, alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.surface, padding: 28 },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage, marginTop: 34, marginBottom: 20 },
  title: { color: colors.text, fontFamily: fonts.serif, fontSize: 30, textAlign: 'center' },
  body: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  error: { color: colors.error, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
  button: { alignSelf: 'stretch', marginTop: 24 },
});
