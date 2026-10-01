import Ionicons from '@expo/vector-icons/Ionicons';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Notice, PageHeader, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { getCollection, saveCollection } from '@/lib/database';

export default function CollectionEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>(); const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [notes, setNotes] = useState(''); const [createdAt, setCreatedAt] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (id) getCollection(id).then(item => { if (item) { setName(item.name); setDescription(item.description); setNotes(item.notes); setCreatedAt(item.createdAt); } }); }, [id]);
  const save = async () => { if (!name.trim()) return setError('Give this collection a name.'); setSaving(true); const now = new Date().toISOString(); const collectionId = id ?? randomUUID(); try { await saveCollection({ id: collectionId, name: name.trim(), description: description.trim(), notes: notes.trim(), createdAt: createdAt || now, updatedAt: now }); router.replace(`/collection/${collectionId}`); } catch { setError('The collection could not be saved.'); setSaving(false); } };
  return <Screen><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.muted}/><Text style={styles.backText}>Back</Text></Pressable><PageHeader eyebrow={id ? 'UPDATE COLLECTION' : 'NEW COLLECTION'} title={id ? 'Edit collection' : 'Create a collection'} subtitle="Give this chapter of your care a name and a little context."/>{error && <Notice error>{error}</Notice>}<View style={styles.form}><Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Heart health" maxLength={100}/><Field label="Description" value={description} onChangeText={setDescription} multiline placeholder="What belongs in this collection?" maxLength={500}/><Field label="Private notes" value={notes} onChangeText={setNotes} multiline placeholder="Reminders, questions, or context for yourself" maxLength={1500}/></View><View style={styles.actions}><Button title="Cancel" kind="secondary" onPress={() => router.back()} style={{ flex: 1 }}/><Button title="Save collection" icon="checkmark" loading={saving} onPress={save} style={{ flex: 1 }}/></View></Screen>;
}
const styles = StyleSheet.create({ back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 18 }, backText: { color: colors.muted }, form: { gap: 18, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 18, backgroundColor: colors.surface }, actions: { flexDirection: 'row', gap: 10, marginTop: 15 } });
