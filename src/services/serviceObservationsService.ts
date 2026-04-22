import { Role } from '../types';

export interface ServiceObservation {
  id: string;
  brotherId: string;
  text: string;
  author: string;
  authorRole: Role;
  createdAt: string;
}

const STORAGE_KEY = 'cmv_service_observations_v1';
let memoryRows: ServiceObservation[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeRow = (row: ServiceObservation): ServiceObservation => ({
  id: row.id,
  brotherId: row.brotherId,
  text: row.text,
  author: row.author,
  authorRole: row.authorRole,
  createdAt: row.createdAt,
});

const readRows = (): ServiceObservation[] => {
  if (!canUseStorage()) {
    return [...memoryRows];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ServiceObservation[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeRow);
  } catch {
    return [];
  }
};

const writeRows = (rows: ServiceObservation[]) => {
  memoryRows = [...rows];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
};

export const serviceObservationsService = {
  listByBrother(brotherId: string): ServiceObservation[] {
    return readRows()
      .filter((row) => row.brotherId === brotherId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  },

  add(input: Omit<ServiceObservation, 'id' | 'createdAt'>): ServiceObservation {
    const next: ServiceObservation = {
      id: `service-observation-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    const rows = [...readRows(), next];
    writeRows(rows);
    return next;
  },
};

