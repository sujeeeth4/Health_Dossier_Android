import * as SQLite from 'expo-sqlite';
import { removeStoredFile } from '@/lib/files';
import { CareCollection, HealthProfile, MedicalRecord, RecordType, emptyHealthSummary } from '@/types/models';

type RecordRow = Omit<MedicalRecord, 'important' | 'collectionIds'> & { important: number };
type SettingRow = { value: string };
const databasePromise = SQLite.openDatabaseAsync('health-dossier.db');

export async function initializeDatabase() {
  const db = await databasePromise;
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((current?.user_version ?? 0) >= 1) return;
  await db.execAsync(`
    BEGIN;
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, date TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', important INTEGER NOT NULL DEFAULT 0,
      fileName TEXT NOT NULL, fileType TEXT NOT NULL, fileSize INTEGER NOT NULL, fileUri TEXT NOT NULL, createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS record_collections (
      recordId TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      collectionId TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      PRIMARY KEY (recordId, collectionId)
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    PRAGMA user_version = 1;
    COMMIT;
  `);
}

async function collectionIdsFor(recordId: string) {
  const db = await databasePromise;
  const rows = await db.getAllAsync<{ collectionId: string }>('SELECT collectionId FROM record_collections WHERE recordId = ?', recordId);
  return rows.map(row => row.collectionId);
}

function mapRecord(row: RecordRow, collectionIds: string[]): MedicalRecord {
  return { ...row, type: row.type as RecordType, important: Boolean(row.important), collectionIds };
}

export async function listRecords() {
  const db = await databasePromise;
  const rows = await db.getAllAsync<RecordRow>('SELECT * FROM records ORDER BY date DESC, createdAt DESC');
  return Promise.all(rows.map(async row => mapRecord(row, await collectionIdsFor(row.id))));
}

export async function getRecord(id: string) {
  const db = await databasePromise;
  const row = await db.getFirstAsync<RecordRow>('SELECT * FROM records WHERE id = ?', id);
  return row ? mapRecord(row, await collectionIdsFor(id)) : null;
}

export async function saveRecord(record: MedicalRecord) {
  const db = await databasePromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync(`INSERT INTO records (id,title,type,date,provider,notes,important,fileName,fileType,fileSize,fileUri,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,type=excluded.type,date=excluded.date,provider=excluded.provider,notes=excluded.notes,
      important=excluded.important,fileName=excluded.fileName,fileType=excluded.fileType,fileSize=excluded.fileSize,fileUri=excluded.fileUri`,
      record.id, record.title, record.type, record.date, record.provider, record.notes, record.important ? 1 : 0,
      record.fileName, record.fileType, record.fileSize, record.fileUri, record.createdAt);
    await db.runAsync('DELETE FROM record_collections WHERE recordId = ?', record.id);
    for (const collectionId of record.collectionIds) {
      await db.runAsync('INSERT OR IGNORE INTO record_collections (recordId, collectionId) VALUES (?, ?)', record.id, collectionId);
    }
  });
}

export async function deleteRecord(id: string) {
  const record = await getRecord(id);
  const db = await databasePromise;
  await db.runAsync('DELETE FROM records WHERE id = ?', id);
  if (record) removeStoredFile(record.fileUri);
}

export async function listCollections() {
  const db = await databasePromise;
  return db.getAllAsync<CareCollection>('SELECT * FROM collections ORDER BY updatedAt DESC');
}

export async function getCollection(id: string) {
  const db = await databasePromise;
  return db.getFirstAsync<CareCollection>('SELECT * FROM collections WHERE id = ?', id);
}

export async function saveCollection(collection: CareCollection) {
  const db = await databasePromise;
  await db.runAsync(`INSERT INTO collections (id,name,description,notes,createdAt,updatedAt) VALUES (?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,notes=excluded.notes,updatedAt=excluded.updatedAt`,
    collection.id, collection.name, collection.description, collection.notes, collection.createdAt, collection.updatedAt);
}

export async function deleteCollection(id: string) {
  const db = await databasePromise;
  await db.runAsync('DELETE FROM collections WHERE id = ?', id);
}

export async function recordsForCollection(id: string) {
  const all = await listRecords();
  return all.filter(record => record.collectionIds.includes(id));
}

export async function setCollectionRecords(collectionId: string, recordIds: string[]) {
  const db = await databasePromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM record_collections WHERE collectionId = ?', collectionId);
    for (const recordId of recordIds) {
      await db.runAsync('INSERT OR IGNORE INTO record_collections (recordId, collectionId) VALUES (?, ?)', recordId, collectionId);
    }
  });
}

export async function getHealthSummary() {
  const db = await databasePromise;
  const row = await db.getFirstAsync<SettingRow>("SELECT value FROM settings WHERE key = 'healthSummary'");
  if (!row) return emptyHealthSummary();
  try { return { ...emptyHealthSummary(), ...JSON.parse(row.value) } as HealthProfile; } catch { return emptyHealthSummary(); }
}

export async function saveHealthSummary(summary: HealthProfile) {
  const db = await databasePromise;
  await db.runAsync("INSERT INTO settings (key,value) VALUES ('healthSummary',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", JSON.stringify(summary));
}
