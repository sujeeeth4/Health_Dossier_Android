import Ionicons from '@expo/vector-icons/Ionicons';
import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ChoiceChip, Field, Notice, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { getRecord, listCollections, saveRecord } from '@/lib/database';
import { importDocument, ImportedDocument, removeStoredFile } from '@/lib/files';
import { CareCollection, MedicalRecord, RecordType, formatBytes, isValidISODate, recordTypes } from '@/types/models';

export default function RecordEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [original, setOriginal] = useState<MedicalRecord | null>(null);
  const [file, setFile] = useState<ImportedDocument | null>(null);
  const [collections, setCollections] = useState<CareCollection[]>([]);
  const [title, setTitle] = useState(''); const [type, setType] = useState<RecordType>('Other'); const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [provider, setProvider] = useState(''); const [notes, setNotes] = useState(''); const [important, setImportant] = useState(false); const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const saved = useRef(false); const importedUri = useRef('');
  useEffect(() => { listCollections().then(setCollections); if (id) getRecord(id).then(record => { if (!record) return; setOriginal(record); setTitle(record.title); setType(record.type); setDate(record.date); setProvider(record.provider); setNotes(record.notes); setImportant(record.important); setCollectionIds(record.collectionIds); }); }, [id]);
  useEffect(() => () => { if (!saved.current && importedUri.current) removeStoredFile(importedUri.current); }, []);
  const choose = async () => { setError(''); try { const picked = await importDocument(); if (picked) { if (importedUri.current) removeStoredFile(importedUri.current); importedUri.current = picked.fileUri; setFile(picked); if (!title) setTitle(picked.fileName.replace(/\.[^.]+$/, '')); } } catch (cause) { setError(cause instanceof Error ? cause.message : 'The document could not be imported.'); } };
  const toggleCollection = (collectionId: string) => setCollectionIds(current => current.includes(collectionId) ? current.filter(value => value !== collectionId) : [...current, collectionId]);
  const save = async () => {
    if (!original && !file) return setError('Choose a document first.');
    if (!title.trim()) return setError('Give this record a title.');
    if (!isValidISODate(date) || date > new Date().toISOString().slice(0, 10)) return setError('Enter a valid record date in YYYY-MM-DD format.');
    const source = file ?? original!; setSaving(true); setError('');
    const record: MedicalRecord = { id: original?.id ?? randomUUID(), title: title.trim(), type, date, provider: provider.trim(), notes: notes.trim(), important, collectionIds, fileName: source.fileName, fileType: source.fileType, fileSize: source.fileSize, fileUri: source.fileUri, createdAt: original?.createdAt ?? new Date().toISOString() };
    try { await saveRecord(record); saved.current = true; router.replace(`/record/${record.id}`); } catch { setError('The record could not be saved. Please try again.'); setSaving(false); }
  };
  return <Screen>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.muted}/><Text style={styles.backText}>Back</Text></Pressable>
    <PageHeader eyebrow={id ? 'UPDATE DETAILS' : 'NEW DOCUMENT'} title={id ? 'Edit record' : 'Add a record'} subtitle="Keep the original and the details that make it easy to find."/>
    {error && <Notice error>{error}</Notice>}
    {!original && <Pressable onPress={choose} style={styles.upload}><Ionicons name="cloud-upload-outline" size={33} color={colors.green}/><Text style={styles.uploadTitle}>{file ? file.fileName : 'Choose a document'}</Text><Text style={sharedStyles.body}>{file ? formatBytes(file.fileSize) : 'PDF, JPG, PNG, or WebP · up to 25 MB'}</Text></Pressable>}
    <View style={styles.form}><Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Annual blood test" maxLength={140}/><Text style={styles.fieldLabel}>Record type</Text><View style={sharedStyles.wrap}>{recordTypes.map(item => <ChoiceChip key={item} label={item} selected={type === item} onPress={() => setType(item)}/>)}</View><Field label="Record date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation"/><Field label="Care provider" value={provider} onChangeText={setProvider} placeholder="Doctor, clinic, or hospital" maxLength={140}/><Field label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Anything useful to remember" maxLength={1500}/>
      <Pressable onPress={() => setImportant(value => !value)} style={[styles.check, important && styles.checkActive]}><Ionicons name={important ? 'checkbox' : 'square-outline'} size={23} color={important ? colors.green : colors.muted}/><View style={{ flex: 1 }}><Text style={styles.checkTitle}>Mark as important</Text><Text style={sharedStyles.body}>Make this record stand out in the library.</Text></View></Pressable>
      <View style={styles.collectionBlock}><Text style={styles.fieldLabel}>Collections</Text>{collections.length ? <View style={sharedStyles.wrap}>{collections.map(collection => <ChoiceChip key={collection.id} label={collection.name} selected={collectionIds.includes(collection.id)} onPress={() => toggleCollection(collection.id)}/>)}</View> : <Text style={sharedStyles.body}>No collections yet. You can add one from the Collections tab.</Text>}</View>
    </View>
    <View style={styles.actions}><Button title="Cancel" kind="secondary" onPress={() => router.back()} style={{ flex: 1 }}/><Button title={id ? 'Save changes' : 'Add record'} icon="checkmark" loading={saving} onPress={save} style={{ flex: 1 }}/></View>
  </Screen>;
}

const styles = StyleSheet.create({ back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 18 }, backText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 }, upload: { alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.green, borderRadius: 12, padding: 25, backgroundColor: colors.surfaceSoft, marginBottom: 15 }, uploadTitle: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 15 }, form: { gap: 18, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 18, backgroundColor: colors.surface }, fieldLabel: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 12 }, check: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 9 }, checkActive: { borderColor: colors.green, backgroundColor: colors.sage }, checkTitle: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 13, marginBottom: 2 }, collectionBlock: { gap: 10 }, actions: { flexDirection: 'row', gap: 10, marginTop: 15 } });
