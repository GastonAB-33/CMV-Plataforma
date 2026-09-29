export type CincoMinisterios = 'Pastor' | 'Evangelista' | 'Profeta' | 'Maestro' | 'Apóstol';

export interface BrotherStageDates {
  brotherId: string;
  grupoFechaInicio?: string;
  grupoFechaFin?: string;
  grupoInterrumpido?: boolean;
  grupoMotivoInterrupcion?: string;
  grupoFechaInterrupcion?: string;
  grupoInterrumpidoPor?: { id?: string; name?: string; role?: string };
  experienciaFechaRealizacion?: string;
  eddiFechaInicio?: string;
  eddiFechaFin?: string;
  discipuloFechaInicio?: string;
  discipuloFechaFin?: string;
  hermanoMayorFechaInicio?: string;
  hermanoMayorFechaFin?: string;
  liderCelulaFechaInicio?: string;
  liderCelulaFechaFin?: string;
  edemFechaInicio?: string;
  edemFechaFin?: string;
  liderMinisterialFechaInicio?: string;
  ministerioAsignado?: CincoMinisterios;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_stage_dates_v1';

let memoryStageDates: Record<string, BrotherStageDates> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherStageDates> => {
  if (!canUseStorage()) {
    return { ...memoryStageDates };
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

const writeStorage = (data: Record<string, BrotherStageDates>) => {
  memoryStageDates = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota error
    }
  }
};

export const stageDatesService = {
  getBrotherStageDates(brotherId: string): BrotherStageDates | undefined {
    if (!brotherId) return undefined;
    const data = readStorage();
    return data[brotherId];
  },

  saveStageDates(
    brotherId: string,
    updates: Partial<Omit<BrotherStageDates, 'brotherId' | 'updatedAt'>>
  ): BrotherStageDates {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      updatedAt: new Date().toISOString(),
    };

    const next: BrotherStageDates = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = next;
    writeStorage(data);
    return next;
  },

  setGrupoInterrumpido(
    brotherId: string,
    interrumpido: boolean,
    motivo?: string,
    interrumpidoPor?: { id?: string; name?: string; role?: string }
  ): BrotherStageDates {
    const nowIso = new Date().toISOString();
    return this.saveStageDates(brotherId, {
      grupoInterrumpido: interrumpido,
      grupoMotivoInterrupcion: interrumpido ? (motivo?.trim() || undefined) : undefined,
      grupoFechaInterrupcion: interrumpido ? nowIso : undefined,
      grupoInterrumpidoPor: interrumpido ? interrumpidoPor : undefined,
    });
  },
};
