import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Button, Card, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

const features = [
  ['document-text-outline', 'The papers you keep meaning to sort.', 'Prescriptions, lab results, scans, and care notes can live together.'],
  ['search-outline', 'That report from a few years ago.', 'Search by title, provider, type, or a note you remember.'],
  ['folder-open-outline', 'The original, whenever you need it.', 'Open or share the actual document before your next visit.'],
] as const;

export default function WelcomeScreen() {
  return <Screen contentStyle={styles.content}>
    <View style={styles.top}><Brand/><Text style={styles.kicker}>A LITTLE CARE FOR YOUR RECORDS</Text><Text style={styles.hero}>A home for your <Text style={styles.heroEm}>health story.</Text></Text><Text style={styles.lead}>The scan from last summer. Your latest prescription. Keep them together, ready for whatever comes next.</Text><Button title="Start your dossier" icon="arrow-forward" onPress={() => router.push('/signup')}/></View>
    <View style={styles.illustration}><View style={styles.paperBack}/><View style={styles.paper}><Ionicons name="medkit-outline" size={38} color={colors.green}/><View style={styles.paperLine}/><View style={[styles.paperLine, { width: '56%' }]}/></View><View style={styles.folder}><Ionicons name="folder-open-outline" size={74} color={colors.greenStrong}/></View></View>
    <Text style={styles.sectionKicker}>MADE FOR EVERYDAY LIFE</Text><Text style={styles.sectionTitle}>Less looking.{`\n`}<Text style={styles.sectionEm}>More living.</Text></Text>
    <View style={styles.features}>{features.map(([icon, title, body], index) => <Card key={title} style={styles.feature}><Text style={styles.number}>0{index + 1}</Text><Ionicons name={icon} size={24} color={colors.green}/><Text style={styles.featureTitle}>{title}</Text><Text style={sharedStyles.body}>{body}</Text></Card>)}</View>
    <Card style={styles.invitation}><Ionicons name="heart-outline" size={28} color={colors.green}/><View style={{ flex: 1 }}><Text style={styles.invitationTitle}>Begin with one record.</Text><Text style={sharedStyles.body}>A little more organized. A little more at ease.</Text></View><Button title="Get started" onPress={() => router.push('/signup')}/></Card>
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 20 }, top: { gap: 20, paddingBottom: 22 }, kicker: { ...sharedStyles.label, marginTop: 25 }, hero: { color: colors.text, fontFamily: fonts.serif, fontSize: 50, lineHeight: 55, letterSpacing: -1.7 }, heroEm: { color: colors.green, fontStyle: 'italic' }, lead: { ...sharedStyles.body, fontSize: 15, lineHeight: 25 },
  illustration: { height: 250, marginVertical: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage, borderRadius: 120 },
  paperBack: { position: 'absolute', width: 150, height: 170, backgroundColor: '#e5d1b8', borderRadius: 5, transform: [{ rotate: '-8deg' }, { translateX: -18 }] },
  paper: { width: 155, height: 178, padding: 24, backgroundColor: '#f3efe3', borderRadius: 5, transform: [{ rotate: '5deg' }], gap: 15 }, paperLine: { height: 3, width: '90%', backgroundColor: '#9fb0a7', borderRadius: 2 },
  folder: { position: 'absolute', bottom: 26, width: 205, height: 90, borderRadius: 8, backgroundColor: '#6f9b7c', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-2deg' }] },
  sectionKicker: { ...sharedStyles.label, marginTop: 35 }, sectionTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 38, lineHeight: 44, marginTop: 12, marginBottom: 18 }, sectionEm: { color: colors.green, fontStyle: 'italic' },
  features: { gap: 12 }, feature: { gap: 10 }, number: { color: colors.muted, fontFamily: fonts.serif, fontSize: 12 }, featureTitle: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 22 },
  invitation: { marginTop: 28, gap: 14 }, invitationTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 25, marginBottom: 5 },
});
