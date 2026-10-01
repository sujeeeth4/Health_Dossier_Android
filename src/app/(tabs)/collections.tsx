import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, Card, EmptyState, IconButton, PageHeader, Screen, sharedStyles } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { deleteCollection, listCollections, listRecords } from '@/lib/database';
import { CareCollection, MedicalRecord } from '@/types/models';

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<CareCollection[]>([]); const [records, setRecords] = useState<MedicalRecord[]>([]);
  const load = useCallback(() => { Promise.all([listCollections(), listRecords()]).then(([groups, items]) => { setCollections(groups); setRecords(items); }); }, []); useFocusEffect(load);
  const remove = (collection: CareCollection) => Alert.alert(`Delete “${collection.name}”?`, 'Its records will stay in your library.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCollection(collection.id); load(); } }]);
  return <Screen><View style={styles.top}><Brand/><IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')}/></View><PageHeader eyebrow="CARE JOURNEYS" title="Collections" subtitle="Bring related records together around a chapter of your care." action={<Button title="New" icon="add" onPress={() => router.push('/collection/edit')}/>}/>
    {collections.length === 0 ? <EmptyState icon="albums-outline" title="Start a care collection." body="Group records for heart health, dental care, a yearly checkup, or anything else that matters to you." action={<Button title="Create a collection" icon="add" onPress={() => router.push('/collection/edit')}/>}/> : <View style={styles.grid}>{collections.map(collection => { const count = records.filter(record => record.collectionIds.includes(collection.id)).length; return <Pressable key={collection.id} onPress={() => router.push(`/collection/${collection.id}`)}><Card style={styles.card}><View style={styles.cardTop}><View style={styles.icon}><Ionicons name="albums-outline" size={23} color={colors.green}/></View><Pressable hitSlop={10} onPress={() => remove(collection)}><Ionicons name="trash-outline" size={19} color={colors.muted}/></Pressable></View><Text style={styles.name}>{collection.name}</Text><Text numberOfLines={3} style={styles.description}>{collection.description || 'A place for related health records.'}</Text><View style={styles.meta}><Text style={styles.metaText}>{count} {count === 1 ? 'record' : 'records'}</Text><Ionicons name="arrow-forward" size={18} color={colors.green}/></View></Card></Pressable>; })}</View>}
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15 }, grid: { gap: 12 }, card: { gap: 11 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, icon: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage }, name: { color: colors.text, fontFamily: fonts.serif, fontSize: 27 }, description: { ...sharedStyles.body, minHeight: 42 }, meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14 }, metaText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 } });
