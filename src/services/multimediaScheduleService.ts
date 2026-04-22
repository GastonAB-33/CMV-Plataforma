import { MultimediaShift } from '../modules/ministerio-multimedia/types';

export interface MultimediaScheduleEntry {
  id: string;
  date: string;
  hour: string;
  location?: string;
  status?: 'PROGRAMADO' | 'REALIZADO';
  proyeccion: string[];
  luces: string[];
  sonido: string[];
  transmision: string[];
  source: 'base' | 'manual';
}

interface ManualMultimediaScheduleEntry {
  id: string;
  date: string;
  hour: string;
  proyeccion: string[];
  luces: string[];
  sonido: string[];
  transmision: string[];
}

const STORAGE_KEY = 'cmv_multimedia_schedule_entries_v1';

let memoryEntries: ManualMultimediaScheduleEntry[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const todayDateString = (): string => new Date().toISOString().slice(0, 10);

const toTimestamp = (date: string, hour: string): number => {
  const parsed = new Date(`${date}T${hour || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed.getTime();
};

const sortByDateTimeAsc = (left: Pick<MultimediaScheduleEntry, 'date' | 'hour'>, right: Pick<MultimediaScheduleEntry, 'date' | 'hour'>) =>
  toTimestamp(left.date, left.hour) - toTimestamp(right.date, right.hour);

const normalizeStrings = (items: string[]): string[] =>
  items
    .map((item) => item.trim())
    .filter((item) => Boolean(item));

const normalizeManualEntry = (entry: ManualMultimediaScheduleEntry): ManualMultimediaScheduleEntry => ({
  id: entry.id,
  date: entry.date,
  hour: entry.hour,
  proyeccion: normalizeStrings(entry.proyeccion ?? []),
  luces: normalizeStrings(entry.luces ?? []),
  sonido: normalizeStrings(entry.sonido ?? []),
  transmision: normalizeStrings(entry.transmision ?? []),
});

const readManualEntries = (): ManualMultimediaScheduleEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ManualMultimediaScheduleEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeManualEntry);
  } catch {
    return [];
  }
};

const writeManualEntries = (entries: ManualMultimediaScheduleEntry[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const fromBaseShift = (entry: MultimediaShift): MultimediaScheduleEntry => ({
  id: `base-${entry.id}`,
  date: entry.date,
  hour: entry.hour,
  location: entry.location,
  status: entry.status,
  proyeccion: [],
  luces: [],
  sonido: [],
  transmision: [],
  source: 'base',
});

const fromManualEntry = (entry: ManualMultimediaScheduleEntry): MultimediaScheduleEntry => ({
  ...entry,
  source: 'manual',
});

export const multimediaScheduleService = {
  listManualEntries(): ManualMultimediaScheduleEntry[] {
    return readManualEntries().sort(sortByDateTimeAsc);
  },

  addManualEntry(input: Omit<ManualMultimediaScheduleEntry, 'id'>): ManualMultimediaScheduleEntry {
    const newEntry: ManualMultimediaScheduleEntry = normalizeManualEntry({
      id: `manual-${Date.now()}`,
      ...input,
    });
    const next = [...readManualEntries(), newEntry];
    next.sort(sortByDateTimeAsc);
    writeManualEntries(next);
    return newEntry;
  },

  upsertManualEntry(input: Omit<ManualMultimediaScheduleEntry, 'id'> & { id?: string }): ManualMultimediaScheduleEntry {
    const current = readManualEntries();
    let targetIndex = -1;

    if (input.id) {
      targetIndex = current.findIndex((entry) => entry.id === input.id);
    }
    if (targetIndex < 0) {
      targetIndex = current.findIndex((entry) => entry.date === input.date && entry.hour === input.hour);
    }

    if (targetIndex >= 0) {
      const entryId = current[targetIndex].id;
      const updated: ManualMultimediaScheduleEntry = normalizeManualEntry({
        id: entryId,
        date: input.date,
        hour: input.hour,
        proyeccion: input.proyeccion,
        luces: input.luces,
        sonido: input.sonido,
        transmision: input.transmision,
      });
      const next = [...current];
      next[targetIndex] = updated;
      next.sort(sortByDateTimeAsc);
      writeManualEntries(next);
      return updated;
    }

    return this.addManualEntry({
      date: input.date,
      hour: input.hour,
      proyeccion: input.proyeccion,
      luces: input.luces,
      sonido: input.sonido,
      transmision: input.transmision,
    });
  },

  removeManualEntry(id: string): boolean {
    const current = readManualEntries();
    const next = current.filter((entry) => entry.id !== id);
    if (next.length === current.length) {
      return false;
    }
    writeManualEntries(next);
    return true;
  },

  listAll(baseShifts: MultimediaShift[]): MultimediaScheduleEntry[] {
    const base = baseShifts.map(fromBaseShift);
    const manual = readManualEntries().map(fromManualEntry);
    return [...base, ...manual].sort(sortByDateTimeAsc);
  },

  listUpcoming(baseShifts: MultimediaShift[], fromDate: string = todayDateString()): MultimediaScheduleEntry[] {
    return this.listAll(baseShifts).filter((entry) => entry.date >= fromDate);
  },
};
