import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppLock } from '@/components/app-lock';
import { Brand, Button, Card, Notice, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { completeOnboarding } from '@/lib/session';

export default function SignupScreen() {
  const { enabled, biometricAvailable, enable } = useAppLock();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/records');
  };

  const protect = async () => {
    setBusy(true);
    setError('');
    const result = await enable();
    setBusy(false);
    if (!result.success) return setError(result.message);
    await finish();
  };

  return <Screen contentStyle={styles.content}>
    <View style={styles.header}><Brand/><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={19} color={colors.muted}/><Text style={styles.backText}>Back</Text></Pressable></View>
    <View style={styles.story}><Text style={styles.kicker}>PRIVATE BY DESIGN</Text><Text style={styles.storyTitle}>Your records.{`\n`}For <Text style={styles.em}>your eyes.</Text></Text><Text style={sharedStyles.body}>Choose how to continue. Your health details and original documents remain stored on this device.</Text></View>
    <Card style={styles.card}>
      <Text style={styles.label}>WELCOME</Text>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.intro}>Choose how you would like to continue.</Text>
      <ProviderButton title="Continue with Google" icon={<GoogleLogo/>} onPress={finish}/>
      <ProviderButton title="Continue with Apple" icon={<AppleLogo/>} onPress={finish}/>
      <View style={styles.or}><View style={styles.line}/><Text style={styles.orText}>or protect locally</Text><View style={styles.line}/></View>
      <View style={styles.icon}><Ionicons name={enabled ? 'shield-checkmark' : 'finger-print-outline'} size={30} color={colors.green}/></View>
      <Text style={styles.label}>{enabled ? 'PROTECTION IS ON' : 'DEVICE PROTECTION'}</Text>
      <Text style={styles.title}>{enabled ? 'Your dossier is protected' : 'Lock your dossier?'}</Text>
      <Text style={styles.intro}>{enabled ? 'Your device will authenticate you when you return to the app.' : 'Use a strong fingerprint or face unlock to protect the app whenever you leave it.'}</Text>
      {error ? <Notice error>{error}</Notice> : null}
      {enabled
        ? <Button title="Continue to my dossier" icon="arrow-forward" onPress={finish}/>
        : <>
          <Button title="Protect with biometrics" icon="finger-print-outline" loading={busy} disabled={biometricAvailable === false} onPress={protect}/>
          {biometricAvailable === false ? <Text style={styles.unavailable}>Add a strong fingerprint or face unlock in Android Settings to enable protection.</Text> : null}
          <Button title="Continue without app lock" kind="secondary" disabled={busy} onPress={finish}/>
        </>}
    </Card>
    <Text style={styles.foot}>You can change protection and lock timing in Settings.</Text>
  </Screen>;
}

function ProviderButton({ title, icon, onPress }: { title: string; icon: React.ReactNode; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.provider, pressed && styles.providerPressed]}>
    <View style={styles.providerIcon}>{icon}</View>
    <Text style={styles.providerText}>{title}</Text>
    <View style={styles.providerSpacer}/>
  </Pressable>;
}

function GoogleLogo() {
  return <Svg width={22} height={22} viewBox="0 0 48 48" accessibilityLabel="Google">
    <Path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7A19.9 19.9 0 0 0 24 4 20 20 0 1 0 20 43.6 20 20 0 0 0 44 24c0-1.4-.1-2.7-.4-4z"/>
    <Path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7A19.9 19.9 0 0 0 6.3 14.7z"/>
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.9 28.5l-6.5 5A20 20 0 0 0 24 44z"/>
    <Path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.4-.1-2.7-.4-4z"/>
  </Svg>;
}

function AppleLogo() {
  return <View style={styles.appleBadge}><Ionicons name="logo-apple" size={20} color="#111111" accessibilityLabel="Apple"/></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 20 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 9 }, backText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
  story: { paddingVertical: 42, gap: 13 }, kicker: sharedStyles.label, storyTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 36, lineHeight: 43 }, em: { color: colors.green, fontStyle: 'italic' },
  card: { gap: 14, padding: 22 }, icon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 3 }, label: sharedStyles.label,
  provider: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surfaceSoft, paddingHorizontal: 16 }, providerPressed: { opacity: 0.72 }, providerIcon: { width: 28, alignItems: 'center', justifyContent: 'center' }, providerText: { flex: 1, color: colors.text, fontFamily: fonts.sansMedium, fontSize: 13, textAlign: 'center' }, providerSpacer: { width: 28 },
  appleBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  or: { flexDirection: 'row', alignItems: 'center', gap: 11, marginVertical: 4 }, line: { flex: 1, height: 1, backgroundColor: colors.line }, orText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 },
  title: { color: colors.text, fontFamily: fonts.serif, fontSize: 30 }, intro: { ...sharedStyles.body, marginBottom: 5 }, unavailable: { color: colors.error, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  foot: { color: colors.muted, fontFamily: fonts.serif, fontSize: 15, fontStyle: 'italic', textAlign: 'center', paddingVertical: 28 },
});
