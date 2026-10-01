import Ionicons from '@expo/vector-icons/Ionicons';
import { randomUUID } from 'expo-crypto';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, Card, ChoiceChip, EmptyState, Field, Notice, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { getHealthSummary, saveHealthSummary } from '@/lib/database';
import { Medication, emptyHealthSummary, isValidISODate } from '@/types/models';

const bloodTypes = ['', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'];
const lines = (value: string) => value.split('\n');

export default function SummaryScreen() {
  const [summary, setSummary] = useState(emptyHealthSummary());
  const [draft, setDraft] = useState(emptyHealthSummary());
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => { getHealthSummary().then(setSummary).catch(() => setMessage('Your health summary could not be opened.')); }, []);
  useFocusEffect(load);
  const hasSummary = useMemo(() => Boolean(summary.fullName || summary.birthDate || summary.bloodType || summary.allergies.length || summary.conditions.length || summary.medications.length || summary.emergencyContact.name || summary.careNotes), [summary]);
  const begin = () => { setDraft(JSON.parse(JSON.stringify(summary))); setMessage(''); setEditing(true); };
  const updateMedication = (id: string, field: keyof Omit<Medication, 'id'>, value: string) => setDraft(current => ({ ...current, medications: current.medications.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  const save = async () => {
    if (draft.birthDate && (!isValidISODate(draft.birthDate) || draft.birthDate > new Date().toISOString().slice(0, 10))) return setMessage('Enter a valid date of birth in YYYY-MM-DD format.');
    setSaving(true); setMessage('');
    const clean = { ...draft, fullName: draft.fullName.trim(), allergies: draft.allergies.map(item => item.trim()).filter(Boolean), conditions: draft.conditions.map(item => item.trim()).filter(Boolean), medications: draft.medications.filter(item => item.name.trim()).map(item => ({ ...item, name: item.name.trim() })), updatedAt: new Date().toISOString() };
    try { await saveHealthSummary(clean); setSummary(clean); setEditing(false); setMessage('Health summary saved.'); } catch { setMessage('Your health summary could not be saved.'); } finally { setSaving(false); }
  };

  return <Screen>
    <View style={styles.top}><Brand/><Pressable onPress={() => Alert.alert('Local dossier', 'Your records and health details stay on this device.')}><Ionicons name="lock-closed-outline" size={21} color={colors.muted}/></Pressable></View>
    <PageHeader eyebrow="MY HEALTH DOSSIER" title="Health summary" subtitle="The details you want close at hand." action={hasSummary && !editing ? <Button title="Edit" icon="pencil" kind="secondary" onPress={begin}/> : undefined}/>
    {message && <Notice error={!message.includes('saved')}>{message}</Notice>}
    {editing ? <View style={styles.form}>
      <Text style={styles.formTitle}>{hasSummary ? 'Update your summary' : 'Create your summary'}</Text>
      <FormSection icon="person-outline" title="Personal details">
        <Field label="Full name" value={draft.fullName} onChangeText={fullName => setDraft({ ...draft, fullName })} placeholder="Your name"/>
        <Field label="Date of birth" value={draft.birthDate} onChangeText={birthDate => setDraft({ ...draft, birthDate })} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation"/>
        <Text style={styles.fieldLabel}>Blood type</Text><View style={sharedStyles.wrap}>{bloodTypes.map(type => <ChoiceChip key={type || 'none'} label={type || 'Not added'} selected={draft.bloodType === type} onPress={() => setDraft({ ...draft, bloodType: type })}/>)}</View>
      </FormSection>
      <FormSection icon="shield-checkmark-outline" title="Allergies and conditions">
        <Field label="Allergies" value={draft.allergies.join('\n')} onChangeText={value => setDraft({ ...draft, allergies: lines(value) })} multiline placeholder={'Penicillin\nPeanuts'} hint="Add one item per line."/>
        <Field label="Ongoing conditions" value={draft.conditions.join('\n')} onChangeText={value => setDraft({ ...draft, conditions: lines(value) })} multiline placeholder={'Asthma\nHigh blood pressure'} hint="Add one item per line."/>
      </FormSection>
      <FormSection icon="medical-outline" title="Current medications">
        {draft.medications.map(item => <Card key={item.id} style={styles.medEditor}><Field label="Medication" value={item.name} onChangeText={value => updateMedication(item.id, 'name', value)} placeholder="Medication name"/><Field label="Dose" value={item.dosage} onChangeText={value => updateMedication(item.id, 'dosage', value)} placeholder="e.g. 10 mg"/><Field label="Schedule" value={item.schedule} onChangeText={value => updateMedication(item.id, 'schedule', value)} placeholder="Every morning"/><Button title="Remove" icon="trash-outline" kind="danger" onPress={() => setDraft({ ...draft, medications: draft.medications.filter(m => m.id !== item.id) })}/></Card>)}
        <Button title="Add medication" icon="add" kind="secondary" onPress={() => setDraft({ ...draft, medications: [...draft.medications, { id: randomUUID(), name: '', dosage: '', schedule: '' }] })}/>
      </FormSection>
      <FormSection icon="call-outline" title="Emergency contact"><Field label="Name" value={draft.emergencyContact.name} onChangeText={name => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, name } })}/><Field label="Relationship" value={draft.emergencyContact.relationship} onChangeText={relationship => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, relationship } })}/><Field label="Phone number" keyboardType="phone-pad" value={draft.emergencyContact.phone} onChangeText={phone => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, phone } })}/></FormSection>
      <FormSection icon="document-text-outline" title="Care notes"><Field label="Notes" value={draft.careNotes} onChangeText={careNotes => setDraft({ ...draft, careNotes })} multiline maxLength={1500} placeholder="Preferences, reminders, or anything useful for your care."/></FormSection>
      <View style={styles.actions}><Button title="Cancel" kind="secondary" onPress={() => setEditing(false)} style={{ flex: 1 }}/><Button title="Save summary" icon="checkmark" loading={saving} onPress={save} style={{ flex: 1 }}/></View>
    </View> : !hasSummary ? <EmptyState icon="heart-outline" title="Keep the essentials together." body="Add medications, allergies, conditions, and an emergency contact so they are easy to find." action={<Button title="Create my health summary" icon="add" onPress={begin}/>}/> : <View style={styles.grid}>
      <Card style={styles.profile}><View style={styles.profileIcon}><Ionicons name="person-outline" size={28} color={colors.green}/></View><View style={{ flex: 1 }}><Text style={sharedStyles.label}>PERSONAL DETAILS</Text><Text style={styles.profileName}>{summary.fullName || 'Your health summary'}</Text><Text style={sharedStyles.body}>{summary.birthDate || 'Date of birth not added'}{summary.bloodType ? `  ·  Blood type ${summary.bloodType}` : ''}</Text></View></Card>
      <ListCard icon="shield-checkmark-outline" title="Allergies" items={summary.allergies}/><ListCard icon="heart-outline" title="Ongoing conditions" items={summary.conditions}/>
      <Card><CardTitle icon="medical-outline" title="Current medications"/><View style={styles.list}>{summary.medications.length ? summary.medications.map(item => <View key={item.id} style={styles.listRow}><Text style={styles.rowTitle}>{item.name}</Text><Text style={sharedStyles.body}>{[item.dosage, item.schedule].filter(Boolean).join(' · ') || 'No dose or schedule added'}</Text></View>) : <Text style={sharedStyles.body}>No medications added.</Text>}</View></Card>
      <Card><CardTitle icon="call-outline" title="Emergency contact"/>{summary.emergencyContact.name || summary.emergencyContact.phone ? <Pressable onPress={() => summary.emergencyContact.phone && Linking.openURL(`tel:${summary.emergencyContact.phone}`)} style={styles.contact}><Text style={styles.rowTitle}>{summary.emergencyContact.name || 'Unnamed contact'}</Text><Text style={sharedStyles.body}>{summary.emergencyContact.relationship}</Text><Text style={styles.phone}>{summary.emergencyContact.phone}</Text></Pressable> : <Text style={sharedStyles.body}>No emergency contact added.</Text>}</Card>
      <Card><CardTitle icon="document-text-outline" title="Care notes"/><Text style={styles.notes}>{summary.careNotes || 'No care notes added.'}</Text></Card>
    </View>}
  </Screen>;
}

function FormSection({ icon, title, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; children: React.ReactNode }) { return <View style={styles.formSection}><View style={styles.sectionTitle}><Ionicons name={icon} size={20} color={colors.green}/><Text style={styles.sectionTitleText}>{title}</Text></View>{children}</View>; }
function CardTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) { return <View style={styles.cardTitle}><Ionicons name={icon} size={20} color={colors.green}/><Text style={styles.sectionTitleText}>{title}</Text></View>; }
function ListCard({ icon, title, items }: { icon: keyof typeof Ionicons.glyphMap; title: string; items: string[] }) { return <Card><CardTitle icon={icon} title={title}/><View style={sharedStyles.wrap}>{items.length ? items.map(item => <View style={styles.tag} key={item}><Text style={styles.tagText}>{item}</Text></View>) : <Text style={sharedStyles.body}>Nothing added yet.</Text>}</View></Card>; }

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15 }, grid: { gap: 12 }, profile: { flexDirection: 'row', alignItems: 'center', gap: 16 }, profileIcon: { width: 58, height: 65, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line, transform: [{ rotate: '-3deg' }] }, profileName: { color: colors.text, fontFamily: fonts.serif, fontSize: 25, marginVertical: 5 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line }, sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 }, sectionTitleText: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 15 },
  cardTitleText: { color: colors.text }, list: { gap: 12 }, listRow: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 12 }, rowTitle: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 14, marginBottom: 4 },
  tag: { backgroundColor: colors.surfaceSoft, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }, tagText: { color: colors.text, fontFamily: fonts.sans, fontSize: 12 }, contact: { gap: 4 }, phone: { color: colors.green, fontFamily: fonts.sansMedium, marginTop: 4 }, notes: { color: colors.muted, fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 25 },
  form: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface, overflow: 'hidden' }, formTitle: { color: colors.text, fontFamily: fonts.serif, fontSize: 29, padding: 20, borderBottomWidth: 1, borderBottomColor: colors.line }, formSection: { padding: 18, gap: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  fieldLabel: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 12 }, medEditor: { gap: 12, backgroundColor: colors.backgroundRaised }, actions: { flexDirection: 'row', gap: 10, padding: 18 },
});
