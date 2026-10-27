export interface BrotherBautismoData {
  brotherId: string;
  fechaRealizacion?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_bautismo_v1';

let memoryBautismo: Record<string, BrotherBautismoData> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherBautismoData> => {
  if (!canUseStorage()) {
    return { ...memoryBautismo };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, BrotherBautismoData>) => {
  memoryBautismo = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota
    }
  }
};

export const bautismoService = {
  getBautismoDate(brotherId: string): string | undefined {
    if (!brotherId) return undefined;
    const data = readStorage();
    return data[brotherId]?.fechaRealizacion;
  },

  saveBautismoDate(brotherId: string, fechaRealizacion?: string): BrotherBautismoData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      updatedAt: new Date().toISOString(),
    };

    const next: BrotherBautismoData = {
      ...current,
      fechaRealizacion: fechaRealizacion?.trim() ? fechaRealizacion.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = next;
    writeStorage(data);
    return next;
  },

  clearBautismoDate(brotherId: string): void {
    if (!brotherId) return;
    const data = readStorage();
    if (data[brotherId]) {
      delete data[brotherId];
      writeStorage(data);
    }
  },
};
