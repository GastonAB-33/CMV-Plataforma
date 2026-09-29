export interface BrotherExperienciaData {
  brotherId: string;
  fechaRealizacion?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_experiencia_v1';

let memoryExperiencia: Record<string, BrotherExperienciaData> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherExperienciaData> => {
  if (!canUseStorage()) {
    return { ...memoryExperiencia };
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

const writeStorage = (data: Record<string, BrotherExperienciaData>) => {
  memoryExperiencia = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota
    }
  }
};

export const experienciaService = {
  getExperienciaDate(brotherId: string): string | undefined {
    if (!brotherId) return undefined;
    const data = readStorage();
    return data[brotherId]?.fechaRealizacion;
  },

  saveExperienciaDate(brotherId: string, fechaRealizacion?: string): BrotherExperienciaData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      updatedAt: new Date().toISOString(),
    };

    const next: BrotherExperienciaData = {
      ...current,
      fechaRealizacion: fechaRealizacion?.trim() ? fechaRealizacion.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = next;
    writeStorage(data);
    return next;
  },
};
