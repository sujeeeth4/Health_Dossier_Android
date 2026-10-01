import * as DocumentPicker from 'expo-document-picker';
import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const maxFileBytes = 25 * 1024 * 1024;
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export type ImportedDocument = { fileName: string; fileType: string; fileSize: number; fileUri: string };

function safeExtension(name: string) {
  const match = name.toLowerCase().match(/\.(pdf|jpe?g|png|webp)$/);
  return match?.[0] ?? '';
}

function mimeTypeFor(name: string, reported?: string) {
  if (reported && allowedTypes.includes(reported)) return reported;
  const extension = safeExtension(name);
  return ({ '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' } as Record<string, string>)[extension] ?? '';
}

export async function importDocument(): Promise<ImportedDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: allowedTypes, copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const type = mimeTypeFor(asset.name, asset.mimeType);
  if (!allowedTypes.includes(type)) throw new Error('Choose a PDF, JPG, PNG, or WebP file.');
  if ((asset.size ?? 0) > maxFileBytes) throw new Error('Choose a file smaller than 25 MB.');

  const recordsDirectory = new Directory(Paths.document, 'records');
  recordsDirectory.create({ idempotent: true, intermediates: true });
  const destination = new File(recordsDirectory, `${randomUUID()}${safeExtension(asset.name)}`);
  try {
    await new File(asset.uri).copy(destination);
    const size = asset.size ?? destination.size;
    if (size > maxFileBytes) { destination.delete(); throw new Error('Choose a file smaller than 25 MB.'); }
    return { fileName: asset.name, fileType: type, fileSize: size, fileUri: destination.uri };
  } catch (cause) {
    if (destination.exists) destination.delete();
    throw cause;
  }
}

export function removeStoredFile(uri: string) {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch { /* A missing file is already removed. */ }
}

export function storedFileExists(uri: string) {
  try { return new File(uri).exists; } catch { return false; }
}

export async function shareDocument(uri: string, mimeType: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable on this device.');
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Save or share this record' });
}

export async function openDocument(uri: string, mimeType: string) {
  if (!storedFileExists(uri)) throw new Error('The original file is missing from this device.');
  if (Platform.OS !== 'android') return shareDocument(uri, mimeType);
  try {
    const contentUri = await FileSystemLegacy.getContentUriAsync(uri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: contentUri, type: mimeType, flags: 1 });
  } catch {
    await shareDocument(uri, mimeType);
  }
}
