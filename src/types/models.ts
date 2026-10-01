export const recordTypes = ['Laboratory', 'Prescription', 'Imaging', 'Vaccination', 'Discharge summary', 'Clinical note', 'Other'] as const;
export type RecordType = (typeof recordTypes)[number];

export type MedicalRecord = {
  id: string;
  title: string;
  type: RecordType;
  date: string;
  provider: string;
  notes: string;
  important: boolean;
  collectionIds: string[];
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUri: string;
  createdAt: string;
};

export type CareCollection = {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Medication = { id: string; name: string; dosage: string; schedule: string };

export type HealthSummary = {
  fullName: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  emergencyContact: { name: string; relationship: string; phone: string };
  careNotes: string;
  updatedAt: string;
};

export type HealthProfile = HealthSummary & { birthDate: string };

export const emptyHealthSummary = (): HealthProfile => ({
  fullName: '', birthDate: '', bloodType: '', allergies: [], conditions: [], medications: [],
  emergencyContact: { name: '', relationship: '', phone: '' }, careNotes: '', updatedAt: '',
});

export function formatDate(value: string) {
  if (!value) return 'No date';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ageAt(date: string, birthDate: string) {
  if (!date || !birthDate || date < birthDate) return null;
  const at = new Date(`${date}T12:00:00`);
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = at.getFullYear() - birth.getFullYear();
  if (at.getMonth() < birth.getMonth() || (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate())) age--;
  return age;
}

export function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
