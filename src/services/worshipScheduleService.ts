import { WorshipRehearsal } from '../modules/ministerio-adoracion/types';

export interface WorshipScheduleEntry {
  id: string;
  date: string;
  hour: string;
  location?: string;
  status?: 'PROGRAMADO' | 'REALIZADO';
  cantantes: string[];
  guitarristas: string[];
  bajistas: string[];
  pianistas: string[];
  bateristas: string[];
  setlistSongIds: string[];
  source: 'base' | 'manual';
}

export interface WorshipMemberUpcomingAssignment {
  id: string;
  memberName: string;
  role: 'Cantante' | 'Guitarrista' | 'Bajista' | 'Pianista' | 'Baterista';
  date: string;
  hour: string;
}

interface ManualWorshipScheduleEntry {
  id: string;
  date: string;
  hour: string;
  cantantes: string[];
  guitarristas: string[];
  bajistas: string[];
  pianistas: string[];
  bateristas: string[];
  setlistSongIds: string[];
}

const STORAGE_KEY = 'cmv_worship_schedule_entries_v1';

let memoryEntries: ManualWorshipScheduleEntry[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const todayDateString = (): string => new Date().toISOString().slice(0, 10);

const toTimestamp = (date: string, hour: string): number => {
  const parsed = new Date(`${date}T${hour || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed.getTime();
};

const sortByDateTimeAsc = (left: Pick<WorshipScheduleEntry, 'date' | 'hour'>, right: Pick<WorshipScheduleEntry, 'date' | 'hour'>) =>
  toTimestamp(left.date, left.hour) - toTimestamp(right.date, right.hour);

const normalizeStrings = (items: string[]): string[] =>
  items
    .map((item) => item.trim())
    .filter((item) => Boolean(item));

const normalizeManualEntry = (entry: ManualWorshipScheduleEntry): ManualWorshipScheduleEntry => ({
  id: entry.id,
  date: entry.date,
  hour: entry.hour,
  cantantes: normalizeStrings(entry.cantantes ?? []),
  guitarristas: normalizeStrings(entry.guitarristas ?? []),
  bajistas: normalizeStrings(entry.bajistas ?? []),
  pianistas: normalizeStrings(entry.pianistas ?? []),
  bateristas: normalizeStrings(entry.bateristas ?? []),
  setlistSongIds: normalizeStrings(entry.setlistSongIds ?? []),
});

const readManualEntries = (): ManualWorshipScheduleEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ManualWorshipScheduleEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeManualEntry);
  } catch {
    return [];
  }
};

const writeManualEntries = (entries: ManualWorshipScheduleEntry[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const fromBaseRehearsal = (entry: WorshipRehearsal): WorshipScheduleEntry => ({
  id: `base-${entry.id}`,
  date: entry.date,
  hour: entry.hour,
  location: entry.location,
  status: entry.status,
  cantantes: [],
  guitarristas: [],
  bajistas: [],
  pianistas: [],
  bateristas: [],
  setlistSongIds: [],
  source: 'base',
});

const fromManualEntry = (entry: ManualWorshipScheduleEntry): WorshipScheduleEntry => ({
  ...entry,
  source: 'manual',
});

export const worshipScheduleService = {
  listManualEntries(): ManualWorshipScheduleEntry[] {
    return readManualEntries().sort(sortByDateTimeAsc);
  },

  addManualEntry(input: Omit<ManualWorshipScheduleEntry, 'id'>): ManualWorshipScheduleEntry {
    const newEntry: ManualWorshipScheduleEntry = normalizeManualEntry({
      id: `manual-${Date.now()}`,
      ...input,
    });
    const next = [...readManualEntries(), newEntry];
    next.sort(sortByDateTimeAsc);
    writeManualEntries(next);
    return newEntry;
  },

  upsertManualEntry(input: Omit<ManualWorshipScheduleEntry, 'id'> & { id?: string }): ManualWorshipScheduleEntry {
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
      const updated: ManualWorshipScheduleEntry = normalizeManualEntry({
        id: entryId,
        date: input.date,
        hour: input.hour,
        cantantes: input.cantantes,
        guitarristas: input.guitarristas,
        bajistas: input.bajistas,
        pianistas: input.pianistas,
        bateristas: input.bateristas,
        setlistSongIds: input.setlistSongIds,
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
      cantantes: input.cantantes,
      guitarristas: input.guitarristas,
      bajistas: input.bajistas,
      pianistas: input.pianistas,
      bateristas: input.bateristas,
      setlistSongIds: input.setlistSongIds,
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

  listAll(rehearsals: WorshipRehearsal[]): WorshipScheduleEntry[] {
    const base = rehearsals.map(fromBaseRehearsal);
    const manual = readManualEntries().map(fromManualEntry);
    return [...base, ...manual].sort(sortByDateTimeAsc);
  },

  listUpcoming(rehearsals: WorshipRehearsal[], fromDate: string = todayDateString()): WorshipScheduleEntry[] {
    return this.listAll(rehearsals).filter((entry) => entry.date >= fromDate);
  },

  listUpcomingAssignments(
    rehearsals: WorshipRehearsal[],
    fromDate: string = todayDateString()
  ): WorshipMemberUpcomingAssignment[] {
    const upcoming = this.listUpcoming(rehearsals, fromDate);
    const rows: WorshipMemberUpcomingAssignment[] = [];

    for (const entry of upcoming) {
      for (const memberName of entry.cantantes) {
        rows.push({
          id: `${entry.id}-cantante-${memberName}`,
          memberName,
          role: 'Cantante',
          date: entry.date,
          hour: entry.hour,
        });
      }
      for (const memberName of entry.guitarristas) {
        rows.push({
          id: `${entry.id}-guitarrista-${memberName}`,
          memberName,
          role: 'Guitarrista',
          date: entry.date,
          hour: entry.hour,
        });
      }
      for (const memberName of entry.bajistas) {
        rows.push({
          id: `${entry.id}-bajista-${memberName}`,
          memberName,
          role: 'Bajista',
          date: entry.date,
          hour: entry.hour,
        });
      }
      for (const memberName of entry.pianistas) {
        rows.push({
          id: `${entry.id}-pianista-${memberName}`,
          memberName,
          role: 'Pianista',
          date: entry.date,
          hour: entry.hour,
        });
      }
      for (const memberName of entry.bateristas) {
        rows.push({
          id: `${entry.id}-baterista-${memberName}`,
          memberName,
          role: 'Baterista',
          date: entry.date,
          hour: entry.hour,
        });
      }
    }

    return rows.sort((left, right) => sortByDateTimeAsc(left, right));
  },
};
