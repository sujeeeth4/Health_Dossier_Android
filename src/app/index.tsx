import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';
import { hasCompletedOnboarding } from '@/lib/session';

export default function Index() {
  const [complete, setComplete] = useState<boolean | null>(null);
  useEffect(() => { hasCompletedOnboarding().then(setComplete).catch(() => setComplete(false)); }, []);
  if (complete === null) return <View style={styles.loading}><ActivityIndicator color={colors.green}/></View>;
  return <Redirect href={complete ? '/(tabs)/records' : '/welcome'} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
