export type MinistryChangeLogModule = 'adoracion' | 'multimedia' | 'misericordia';

export interface MinistryChangeLogEntry {
  id: string;
  createdAt: string;
  module: MinistryChangeLogModule;
  change: string;
  responsible: string;
  details?: string;
}

const STORAGE_KEY = 'cmv_ministry_change_logs_v1';

let memoryEntries: MinistryChangeLogEntry[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readEntries = (): MinistryChangeLogEntry[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MinistryChangeLogEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const writeEntries = (entries: MinistryChangeLogEntry[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const byCreatedAtDesc = (left: MinistryChangeLogEntry, right: MinistryChangeLogEntry) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

export const ministryChangeLogService = {
  list(module?: MinistryChangeLogModule): MinistryChangeLogEntry[] {
    const all = readEntries().sort(byCreatedAtDesc);
    if (!module) {
      return all;
    }
    return all.filter((entry) => entry.module === module);
  },

  add(input: Omit<MinistryChangeLogEntry, 'id' | 'createdAt'>): MinistryChangeLogEntry {
    const entry: MinistryChangeLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      module: input.module,
      change: input.change.trim(),
      responsible: input.responsible.trim(),
      details: input.details?.trim(),
    };
    const next = [...readEntries(), entry].sort(byCreatedAtDesc);
    writeEntries(next);
    return entry;
  },
};
