export type NiveladoEstado = 'ASISTIDO' | 'NO_ASISTIDO' | 'PENDIENTE';

export interface NiveladoRecord {
  id: string;
  nombreEvento: string;
  fecha: string; // YYYY-MM-DD
  estado: NiveladoEstado;
  observacion?: string;
  createdAt: string;
}

export interface BrotherNiveladosData {
  brotherId: string;
  records: NiveladoRecord[];
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_nivelados_v1';

let memoryNivelados: Record<string, NiveladoRecord[]> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, NiveladoRecord[]> => {
  if (!canUseStorage()) return { ...memoryNivelados };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, NiveladoRecord[]>) => {
  memoryNivelados = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota
    }
  }
};

const getDefaultInitialRecords = (): NiveladoRecord[] => [
  {
    id: 'niv-seed-1',
    nombreEvento: 'Nivelados 1 - Primer Cuatrimestre',
    fecha: '2026-04-18',
    estado: 'ASISTIDO',
    observacion: 'Participación activa en todas las plenarias.',
    createdAt: new Date('2026-04-18').toISOString(),
  },
  {
    id: 'niv-seed-2',
    nombreEvento: 'Nivelados 2 - Segundo Cuatrimestre',
    fecha: '2026-08-22',
    estado: 'ASISTIDO',
    observacion: 'Asistencia confirmada con líderes de su célula.',
    createdAt: new Date('2026-08-22').toISOString(),
  },
  {
    id: 'niv-seed-3',
    nombreEvento: 'Nivelados 3 - Cierre de Año',
    fecha: '2026-11-14',
    estado: 'PENDIENTE',
    observacion: 'Próxima convocatoria anual.',
    createdAt: new Date('2026-10-01').toISOString(),
  },
];

export const niveladosService = {
  getRecords(brotherId: string): NiveladoRecord[] {
    if (!brotherId) return [];
    const data = readStorage();
    if (data[brotherId]) {
      return data[brotherId];
    }
    // Seed initial records for demonstration if none exist yet
    const initial = getDefaultInitialRecords();
    data[brotherId] = initial;
    writeStorage(data);
    return initial;
  },

  addRecord(
    brotherId: string,
    record: {
      nombreEvento: string;
      fecha: string;
      estado: NiveladoEstado;
      observacion?: string;
    }
  ): NiveladoRecord {
    const data = readStorage();
    const current = data[brotherId] ? [...data[brotherId]] : [...getDefaultInitialRecords()];
    const newEntry: NiveladoRecord = {
      id: `niv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nombreEvento: record.nombreEvento.trim() || 'Evento de Nivelados',
      fecha: record.fecha || new Date().toISOString().slice(0, 10),
      estado: record.estado,
      observacion: record.observacion?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    current.unshift(newEntry);
    data[brotherId] = current;
    writeStorage(data);
    return newEntry;
  },

  updateRecord(
    brotherId: string,
    recordId: string,
    updates: Partial<Omit<NiveladoRecord, 'id' | 'createdAt'>>
  ): NiveladoRecord | undefined {
    const data = readStorage();
    const current = data[brotherId] ? [...data[brotherId]] : [];
    const index = current.findIndex((item) => item.id === recordId);
    if (index === -1) return undefined;
    const updated = {
      ...current[index],
      ...updates,
      nombreEvento: updates.nombreEvento !== undefined ? updates.nombreEvento.trim() : current[index].nombreEvento,
    };
    current[index] = updated;
    data[brotherId] = current;
    writeStorage(data);
    return updated;
  },

  toggleAttendance(brotherId: string, recordId: string): NiveladoRecord | undefined {
    const data = readStorage();
    const current = data[brotherId] ? [...data[brotherId]] : [];
    const index = current.findIndex((item) => item.id === recordId);
    if (index === -1) return undefined;
    const nextState: NiveladoEstado = current[index].estado === 'ASISTIDO' ? 'NO_ASISTIDO' : 'ASISTIDO';
    const updated = {
      ...current[index],
      estado: nextState,
    };
    current[index] = updated;
    data[brotherId] = current;
    writeStorage(data);
    return updated;
  },

  deleteRecord(brotherId: string, recordId: string): void {
    const data = readStorage();
    if (!data[brotherId]) return;
    data[brotherId] = data[brotherId].filter((item) => item.id !== recordId);
    writeStorage(data);
  },
};
