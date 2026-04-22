import { MisericordiaOutreach } from '../modules/ministerio-misericordia/types';

export interface MisericordiaScheduleEntry {
  id: string;
  date: string;
  hour: string;
  location?: string;
  status?: 'PROGRAMADO' | 'REALIZADO';
  cocina: string[];
  preparacion: string[];
  reparto: string[];
  evangelismo: string[];
  comida: string;
  zona: string;
  callesZona: string[];
  mensaje: string;
  messageIds: string[];
  source: 'base' | 'manual';
}

interface ManualMisericordiaScheduleEntry {
  id: string;
  date: string;
  hour: string;
  cocina: string[];
  preparacion: string[];
  reparto: string[];
  evangelismo: string[];
  comida: string;
  zona: string;
  callesZona: string[];
  mensaje: string;
  messageIds: string[];
}

const STORAGE_KEY = 'cmv_misericordia_schedule_entries_v1';

let memoryEntries: ManualMisericordiaScheduleEntry[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const todayDateString = (): string => new Date().toISOString().slice(0, 10);

const toTimestamp = (date: string, hour: string): number => {
  const parsed = new Date(`${date}T${hour || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed.getTime();
};

const sortByDateTimeAsc = (
  left: Pick<MisericordiaScheduleEntry, 'date' | 'hour'>,
  right: Pick<MisericordiaScheduleEntry, 'date' | 'hour'>
) => toTimestamp(left.date, left.hour) - toTimestamp(right.date, right.hour);

const normalizeStrings = (items: string[]): string[] =>
  items
    .map((item) => item.trim())
    .filter((item) => Boolean(item));

const normalizeManualEntry = (entry: ManualMisericordiaScheduleEntry): ManualMisericordiaScheduleEntry => ({
  id: entry.id,
  date: entry.date,
  hour: entry.hour,
  cocina: normalizeStrings(entry.cocina ?? []),
  preparacion: normalizeStrings(entry.preparacion ?? []),
  reparto: normalizeStrings(entry.reparto ?? []),
  evangelismo: normalizeStrings(entry.evangelismo ?? []),
  comida: entry.comida?.trim() ?? '',
  zona: entry.zona?.trim() ?? '',
  callesZona: normalizeStrings(entry.callesZona ?? []),
  mensaje: entry.mensaje?.trim() ?? '',
  messageIds: normalizeStrings(entry.messageIds ?? []),
});

const readManualEntries = (): ManualMisericordiaScheduleEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ManualMisericordiaScheduleEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeManualEntry);
  } catch {
    return [];
  }
};

const writeManualEntries = (entries: ManualMisericordiaScheduleEntry[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const fromBaseOutreach = (entry: MisericordiaOutreach): MisericordiaScheduleEntry => ({
  id: `base-${entry.id}`,
  date: entry.date,
  hour: entry.hour,
  location: entry.location,
  status: entry.status,
  cocina: [],
  preparacion: [],
  reparto: [],
  evangelismo: [],
  comida: '',
  zona: entry.location ?? '',
  callesZona: [],
  mensaje: '',
  messageIds: [],
  source: 'base',
});

const fromManualEntry = (entry: ManualMisericordiaScheduleEntry): MisericordiaScheduleEntry => ({
  ...entry,
  source: 'manual',
});

export const misericordiaScheduleService = {
  listManualEntries(): ManualMisericordiaScheduleEntry[] {
    return readManualEntries().sort(sortByDateTimeAsc);
  },

  addManualEntry(input: Omit<ManualMisericordiaScheduleEntry, 'id'>): ManualMisericordiaScheduleEntry {
    const newEntry: ManualMisericordiaScheduleEntry = normalizeManualEntry({
      id: `manual-${Date.now()}`,
      ...input,
    });
    const next = [...readManualEntries(), newEntry];
    next.sort(sortByDateTimeAsc);
    writeManualEntries(next);
    return newEntry;
  },

  upsertManualEntry(
    input: Omit<ManualMisericordiaScheduleEntry, 'id'> & { id?: string }
  ): ManualMisericordiaScheduleEntry {
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
      const updated: ManualMisericordiaScheduleEntry = normalizeManualEntry({
        id: entryId,
        date: input.date,
        hour: input.hour,
        cocina: input.cocina,
        preparacion: input.preparacion,
        reparto: input.reparto,
        evangelismo: input.evangelismo,
        comida: input.comida,
        zona: input.zona,
        callesZona: input.callesZona,
        mensaje: input.mensaje,
        messageIds: input.messageIds,
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
      cocina: input.cocina,
      preparacion: input.preparacion,
      reparto: input.reparto,
      evangelismo: input.evangelismo,
      comida: input.comida,
      zona: input.zona,
      callesZona: input.callesZona,
      mensaje: input.mensaje,
      messageIds: input.messageIds,
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

  listAll(baseOutreaches: MisericordiaOutreach[]): MisericordiaScheduleEntry[] {
    const base = baseOutreaches.map(fromBaseOutreach);
    const manual = readManualEntries().map(fromManualEntry);
    return [...base, ...manual].sort(sortByDateTimeAsc);
  },

  listUpcoming(baseOutreaches: MisericordiaOutreach[], fromDate: string = todayDateString()): MisericordiaScheduleEntry[] {
    return this.listAll(baseOutreaches).filter((entry) => entry.date >= fromDate);
  },
};
