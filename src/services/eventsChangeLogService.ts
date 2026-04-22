export interface EventChangeLogEntry {
  id: string;
  createdAt: string;
  change: string;
  responsible: string;
  details?: string;
}

const STORAGE_KEY = 'cmv_events_change_logs_v1';

let memoryEntries: EventChangeLogEntry[] = [];

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const byCreatedAtDesc = (left: EventChangeLogEntry, right: EventChangeLogEntry) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

const readEntries = (): EventChangeLogEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as EventChangeLogEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const writeEntries = (entries: EventChangeLogEntry[]) => {
  const sorted = [...entries].sort(byCreatedAtDesc);
  memoryEntries = sorted;
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
};

export const eventsChangeLogService = {
  list(): EventChangeLogEntry[] {
    return readEntries().sort(byCreatedAtDesc);
  },

  add(input: Omit<EventChangeLogEntry, 'id' | 'createdAt'>): EventChangeLogEntry {
    const entry: EventChangeLogEntry = {
      id: `evlog-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      change: input.change.trim(),
      responsible: input.responsible.trim(),
      details: input.details?.trim(),
    };

    writeEntries([...readEntries(), entry]);
    return entry;
  },
};
