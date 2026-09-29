import { Role } from '../types';

export interface BrotherAltarData {
  brotherId: string;
  hermanoMayorId?: string;
  hermanoMayorName?: string;
  isMatrimonio?: boolean;
  matrimonioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  isInterrumpido: boolean;
  motivoInterrupcion?: string;
  fechaInterrupcion?: string;
  interrumpidoPor?: {
    id?: string;
    name: string;
    role: Role;
  };
  updatedAt: string;
}

export type AltarStageState = 'SIN_ALTAR' | 'EN_PROCESO' | 'INTERRUMPIDO' | 'FINALIZADO';

export const getAltarState = (altar: {
  isInterrumpido?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}): AltarStageState => {
  if (altar.isInterrumpido) {
    return 'INTERRUMPIDO';
  }
  if (altar.fechaFin && altar.fechaFin.trim() !== '') {
    return 'FINALIZADO';
  }
  if (altar.fechaInicio && altar.fechaInicio.trim() !== '') {
    return 'EN_PROCESO';
  }
  return 'SIN_ALTAR';
};

const STORAGE_KEY = 'cmv_altar_tracking_v1';

let memoryAltars: Record<string, BrotherAltarData> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherAltarData> => {
  if (!canUseStorage()) {
    return { ...memoryAltars };
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

const writeStorage = (data: Record<string, BrotherAltarData>) => {
  memoryAltars = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignorar quota
    }
  }
};

export const altarService = {
  getAltarInfo(brotherId: string): BrotherAltarData {
    if (!brotherId) {
      return {
        brotherId: '',
        isInterrumpido: false,
        updatedAt: new Date().toISOString(),
      };
    }
    const data = readStorage();
    const existing = data[brotherId];
    if (existing) {
      return { ...existing };
    }

    return {
      brotherId,
      isInterrumpido: false,
      updatedAt: new Date().toISOString(),
    };
  },

  setHermanoMayor(
    brotherId: string,
    hermanoMayor: { id?: string; name: string; isMatrimonio?: boolean; matrimonioId?: string },
  ): BrotherAltarData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      isInterrumpido: false,
      updatedAt: new Date().toISOString(),
    };

    const updated: BrotherAltarData = {
      ...current,
      hermanoMayorId: hermanoMayor.id ?? current.hermanoMayorId,
      hermanoMayorName: hermanoMayor.name.trim(),
      isMatrimonio: hermanoMayor.isMatrimonio ?? current.isMatrimonio,
      matrimonioId: hermanoMayor.matrimonioId ?? current.matrimonioId,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = updated;
    writeStorage(data);
    return updated;
  },

  setAltarInterrumpido(
    brotherId: string,
    isInterrumpido: boolean,
    motivo?: string,
    actor?: { id?: string; name: string; role: Role },
  ): BrotherAltarData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      isInterrumpido: false,
      updatedAt: new Date().toISOString(),
    };

    const updated: BrotherAltarData = {
      ...current,
      isInterrumpido,
      motivoInterrupcion: isInterrumpido ? motivo?.trim() || 'Sin motivo especificado' : undefined,
      fechaInterrupcion: isInterrumpido ? new Date().toISOString() : undefined,
      interrumpidoPor: isInterrumpido && actor ? { ...actor } : undefined,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = updated;
    writeStorage(data);
    return updated;
  },

  setAltarDates(brotherId: string, fechaInicio?: string, fechaFin?: string): BrotherAltarData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      isInterrumpido: false,
      updatedAt: new Date().toISOString(),
    };

    const updated: BrotherAltarData = {
      ...current,
      fechaInicio: fechaInicio !== undefined ? fechaInicio : current.fechaInicio,
      fechaFin: fechaFin !== undefined ? fechaFin : current.fechaFin,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = updated;
    writeStorage(data);
    return updated;
  },
};
