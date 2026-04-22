export type MisericordiaSupplyMovementType = 'NUEVO' | 'UTILIZADO';
export type MisericordiaSupplyUnit = 'UNIDAD' | 'KG';

export interface MisericordiaSupplyMovement {
  id: string;
  name: string;
  quantity: number;
  unit: MisericordiaSupplyUnit;
  type: MisericordiaSupplyMovementType;
  meal?: string;
  observation?: string;
  createdAt: string;
}

const STORAGE_KEY = 'cmv_misericordia_supply_movements_v1';

let memoryEntries: MisericordiaSupplyMovement[] = [];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeEntry = (entry: MisericordiaSupplyMovement): MisericordiaSupplyMovement => ({
  id: entry.id,
  name: entry.name.trim(),
  quantity: Number.isFinite(entry.quantity) && entry.quantity > 0 ? entry.quantity : 1,
  unit: entry.unit === 'KG' ? 'KG' : 'UNIDAD',
  type: entry.type === 'UTILIZADO' ? 'UTILIZADO' : 'NUEVO',
  meal: entry.meal?.trim() || undefined,
  observation: entry.observation?.trim() || undefined,
  createdAt: entry.createdAt || new Date().toISOString(),
});

const readEntries = (): MisericordiaSupplyMovement[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MisericordiaSupplyMovement[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeEntry);
  } catch {
    return [];
  }
};

const writeEntries = (entries: MisericordiaSupplyMovement[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const byCreatedAtDesc = (a: MisericordiaSupplyMovement, b: MisericordiaSupplyMovement) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const misericordiaSupplyService = {
  list(): MisericordiaSupplyMovement[] {
    return readEntries().sort(byCreatedAtDesc);
  },

  addMovement(input: Omit<MisericordiaSupplyMovement, 'id' | 'createdAt'>): MisericordiaSupplyMovement {
    const nextEntry = normalizeEntry({
      id: `sup-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      ...input,
    });
    const next = [nextEntry, ...readEntries()].sort(byCreatedAtDesc);
    writeEntries(next);
    return nextEntry;
  },
};
