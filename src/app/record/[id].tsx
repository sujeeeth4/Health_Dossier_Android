import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Notice, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { deleteRecord, getRecord, listCollections } from '@/lib/database';
import { openDocument, shareDocument, storedFileExists } from '@/lib/files';
import { CareCollection, MedicalRecord, formatBytes, formatDate } from '@/types/models';

export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<MedicalRecord | null>(null); const [collections, setCollections] = useState<CareCollection[]>([]); const [error, setError] = useState('');
  const load = useCallback(() => { Promise.all([getRecord(id), listCollections()]).then(([item, groups]) => { setRecord(item); setCollections(groups); }); }, [id]); useFocusEffect(load);
  if (!record) return <Screen><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.muted}/><Text style={styles.backText}>Back</Text></Pressable><Text style={sharedStyles.body}>Opening record…</Text></Screen>;
  const act = async (action: () => Promise<void>) => { setError(''); try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'The original file could not be opened.'); } };
  const remove = () => Alert.alert('Remove this record?', 'The record and its saved file will be removed from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { await deleteRecord(record.id); router.replace('/(tabs)/records'); } }]);
  return <Screen>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.muted}/><Text style={styles.backText}>Library</Text></Pressable>
    <PageHeader eyebrow={record.type.toUpperCase()} title={record.title} subtitle={record.provider || 'Care provider not specified'}/>
    {error && <Notice error>{error}</Notice>}{!storedFileExists(record.fileUri) && <Notice error>The original file is missing from this device.</Notice>}
    {record.fileType.startsWith('image/') && storedFileExists(record.fileUri) ? <Image source={record.fileUri} contentFit="contain" style={styles.preview}/> : <View style={styles.document}><Ionicons name="document-text-outline" size={49} color={colors.blue}/><Text style={styles.documentName}>{record.fileName}</Text><Text style={sharedStyles.body}>{formatBytes(record.fileSize)}</Text></View>}
    <Card style={styles.details}><Detail label="Date" value={formatDate(record.date)}/><Detail label="Original file" value={`${record.fileName} · ${formatBytes(record.fileSize)}`}/>{record.important && <Detail label="Status" value="Important"/>}{record.collectionIds.length ? <View style={styles.detail}><Text style={styles.detailLabel}>Collections</Text><View style={sharedStyles.wrap}>{collections.filter(item => record.collectionIds.includes(item.id)).map(item => <Pressable key={item.id} onPress={() => router.push(`/collection/${item.id}`)} style={styles.tag}><Text style={styles.tagText}>{item.name}</Text></Pressable>)}</View></View> : null}{record.notes ? <Detail label="Notes" value={record.notes}/> : null}</Card>
    <View style={styles.actions}><Button title="Open original" icon="open-outline" onPress={() => act(() => openDocument(record.fileUri, record.fileType))}/><Button title="Save or share" icon="share-outline" kind="secondary" onPress={() => act(() => shareDocument(record.fileUri, record.fileType))}/><Button title="Edit details" icon="pencil" kind="secondary" onPress={() => router.push({ pathname: '/record/edit', params: { id: record.id } })}/><Button title="Remove record" icon="trash-outline" kind="danger" onPress={remove}/></View>
  </Screen>;
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }
const styles = StyleSheet.create({ back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 18 }, backText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 }, preview: { width: '100%', height: 360, borderRadius: 12, backgroundColor: colors.surfaceSoft, marginBottom: 14 }, document: { height: 220, alignItems: 'center', justifyContent: 'center', gap: 11, borderRadius: 12, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line, marginBottom: 14 }, documentName: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 14 }, details: { gap: 17 }, detail: { gap: 6 }, detailLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 }, detailValue: { color: colors.text, fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21 }, tag: { backgroundColor: colors.sage, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 }, tagText: { color: colors.greenStrong, fontFamily: fonts.sansMedium, fontSize: 12 }, actions: { gap: 10, marginTop: 15 } });
