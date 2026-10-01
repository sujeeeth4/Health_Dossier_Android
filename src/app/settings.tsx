import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, Card, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { clearOnboarding } from '@/lib/session';

export default function SettingsScreen() {
  const signOut = () => Alert.alert('Return to welcome?', 'Your health summary, records, and collections will remain on this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: async () => { await clearOnboarding(); router.replace('/welcome'); } }]);
  return <Screen><View style={styles.top}><Brand/><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={colors.muted}/></Pressable></View><PageHeader eyebrow="ON THIS DEVICE" title="Settings" subtitle="Health Dossier is private and local by design."/>
    <Card style={styles.card}><View style={styles.icon}><Ionicons name="phone-portrait-outline" size={24} color={colors.green}/></View><View style={{ flex: 1 }}><Text style={styles.title}>Local storage</Text><Text style={sharedStyles.body}>Your dossier and original documents are stored inside this app on this device.</Text></View></Card>
    <Card style={styles.card}><View style={styles.icon}><Ionicons name="cloud-offline-outline" size={24} color={colors.green}/></View><View style={{ flex: 1 }}><Text style={styles.title}>Works offline</Text><Text style={sharedStyles.body}>Viewing and organizing your saved records does not require an internet connection.</Text></View></Card>
    <Button title="Return to welcome screen" icon="log-out-outline" kind="secondary" onPress={signOut} style={styles.signOut}/><Text style={styles.version}>Health Dossier · Android 1.0.0</Text>
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15 }, close: { padding: 10 }, card: { flexDirection: 'row', gap: 14, marginBottom: 12 }, icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage }, title: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 15, marginBottom: 6 }, signOut: { marginTop: 10 }, version: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: 20 } });
