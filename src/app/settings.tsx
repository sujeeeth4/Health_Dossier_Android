import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppLock } from '@/components/app-lock';
import { Brand, Button, Card, ChoiceChip, Notice, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { appLockTimeouts } from '@/lib/session';

export default function SettingsScreen() {
  const { enabled, timeout, biometricAvailable, enable, disable, updateTimeout, lockNow } = useAppLock();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const turnOn = async () => {
    setBusy(true); setMessage('');
    const result = await enable();
    setBusy(false);
    if (result.success) { setError(false); setMessage('App lock is on.'); }
    else { setError(true); setMessage(result.message); }
  };

  const turnOff = () => Alert.alert('Turn off app lock?', 'Anyone who can open this device will be able to view your dossier.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Turn off', style: 'destructive', onPress: async () => {
      setBusy(true); setMessage('');
      const result = await disable();
      setBusy(false);
      if (result.success) { setError(false); setMessage('App lock is off.'); }
      else { setError(true); setMessage(result.message); }
    } },
  ]);

  const chooseTimeout = async (value: typeof timeout) => {
    try { await updateTimeout(value); setError(false); setMessage('Lock timing updated.'); }
    catch { setError(true); setMessage('Lock timing could not be saved.'); }
  };

  return <Screen>
    <View style={styles.top}><Brand/><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={colors.muted}/></Pressable></View>
    <PageHeader eyebrow="ON THIS DEVICE" title="Settings" subtitle="Privacy controls for your local health dossier."/>
    {message ? <Notice error={error}>{message}</Notice> : null}
    <Card style={styles.lockCard}>
      <View style={styles.cardHeading}><View style={styles.icon}><Ionicons name={enabled ? 'lock-closed' : 'lock-open-outline'} size={24} color={colors.green}/></View><View style={styles.headingText}><Text style={styles.title}>App lock</Text><Text style={sharedStyles.body}>{enabled ? 'Protected with your device authentication.' : 'Require authentication before showing your records.'}</Text></View></View>
      {enabled ? <>
        <View style={styles.timeout}><Text style={styles.sectionLabel}>LOCK AFTER LEAVING THE APP</Text><View style={sharedStyles.wrap}>{appLockTimeouts.map(option => <ChoiceChip key={option.value} label={option.label} selected={timeout === option.value} onPress={() => chooseTimeout(option.value)}/>)}</View></View>
        <Button title="Lock now" icon="lock-closed-outline" onPress={lockNow}/>
        <Button title="Turn off app lock" icon="lock-open-outline" kind="danger" loading={busy} onPress={turnOff}/>
      </> : <>
        <Button title="Protect with biometrics" icon="finger-print-outline" loading={busy} disabled={biometricAvailable === false} onPress={turnOn}/>
        {biometricAvailable === false ? <Text style={styles.unavailable}>Add a strong fingerprint or face unlock in Android Settings first.</Text> : null}
      </>}
    </Card>
    <Card style={styles.card}><View style={styles.icon}><Ionicons name="phone-portrait-outline" size={24} color={colors.green}/></View><View style={{ flex: 1 }}><Text style={styles.title}>Local storage</Text><Text style={sharedStyles.body}>Your dossier and original documents are stored inside this app on this device.</Text></View></Card>
    <Card style={styles.card}><View style={styles.icon}><Ionicons name="cloud-offline-outline" size={24} color={colors.green}/></View><View style={{ flex: 1 }}><Text style={styles.title}>Works offline</Text><Text style={sharedStyles.body}>Viewing and organizing your saved records does not require an internet connection.</Text></View></Card>
    <Text style={styles.version}>Health Dossier · Android 1.0.0</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15 }, close: { padding: 10 }, card: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  lockCard: { gap: 14, marginBottom: 12 }, cardHeading: { flexDirection: 'row', gap: 14, alignItems: 'center' }, headingText: { flex: 1 }, icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage },
  title: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 15, marginBottom: 6 }, timeout: { gap: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 15 }, sectionLabel: { ...sharedStyles.label, color: colors.muted }, unavailable: { color: colors.error, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17 },
  version: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: 20 },
});
