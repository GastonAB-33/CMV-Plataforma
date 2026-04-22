export interface MultimediaEquipmentEntry {
  id: string;
  name: string;
  observation: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_multimedia_equipment_v1';

let memoryEntries: MultimediaEquipmentEntry[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeEntry = (entry: MultimediaEquipmentEntry): MultimediaEquipmentEntry => ({
  id: entry.id,
  name: entry.name.trim(),
  observation: entry.observation.trim(),
  updatedAt: entry.updatedAt || new Date().toISOString(),
});

const readEntries = (): MultimediaEquipmentEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MultimediaEquipmentEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeEntry);
  } catch {
    return [];
  }
};

const writeEntries = (entries: MultimediaEquipmentEntry[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const multimediaEquipmentService = {
  list(): MultimediaEquipmentEntry[] {
    return readEntries().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  add(name: string, observation: string): MultimediaEquipmentEntry {
    const nextEntry = normalizeEntry({
      id: `eq-${Date.now()}`,
      name,
      observation,
      updatedAt: new Date().toISOString(),
    });
    const next = [nextEntry, ...readEntries()];
    writeEntries(next);
    return nextEntry;
  },
};

