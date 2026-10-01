import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { initializeDatabase } from '@/lib/database';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => { initializeDatabase().finally(() => setReady(true)); }, []);
  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.green}/><StatusBar style="light"/></View>;
  return <SafeAreaProvider><StatusBar style="light"/><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }} /></SafeAreaProvider>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
