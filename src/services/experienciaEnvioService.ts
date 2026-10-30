export interface BrotherExperienciaEnvioData {
  brotherId: string;
  fechaRealizacion?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_experiencia_envio_v1';

let memoryExperienciaEnvio: Record<string, BrotherExperienciaEnvioData> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherExperienciaEnvioData> => {
  if (!canUseStorage()) {
    return { ...memoryExperienciaEnvio };
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

const writeStorage = (data: Record<string, BrotherExperienciaEnvioData>) => {
  memoryExperienciaEnvio = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota
    }
  }
};

export const experienciaEnvioService = {
  getExperienciaEnvioDate(brotherId: string): string | undefined {
    if (!brotherId) return undefined;
    const data = readStorage();
    return data[brotherId]?.fechaRealizacion;
  },

  saveExperienciaEnvioDate(brotherId: string, fechaRealizacion?: string): BrotherExperienciaEnvioData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      updatedAt: new Date().toISOString(),
    };

    const next: BrotherExperienciaEnvioData = {
      ...current,
      fechaRealizacion: fechaRealizacion?.trim() ? fechaRealizacion.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = next;
    writeStorage(data);
    return next;
  },
};
