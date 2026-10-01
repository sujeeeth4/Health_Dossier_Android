import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { colors, fonts } from '@/constants/theme';

export default function TabsLayout() {
  return <Tabs initialRouteName="records" screenOptions={{
    headerShown: false, sceneStyle: { backgroundColor: colors.background }, tabBarActiveTintColor: colors.green,
    tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 72, paddingTop: 7, paddingBottom: 9 },
    tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
  }}>
    <Tabs.Screen name="summary" options={{ title: 'Summary', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size}/> }}/>
    <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({ color, size }) => <Ionicons name="documents-outline" color={color} size={size}/> }}/>
    <Tabs.Screen name="collections" options={{ title: 'Collections', tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size}/> }}/>
  </Tabs>;
}
