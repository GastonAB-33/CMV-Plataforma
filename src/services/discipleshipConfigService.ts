export interface DiscipleshipConfig {
  minAltaresForGrupoVida: number;
  minDiscipulosForLiderCelula: number;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_discipleship_config_v1';
const DEFAULT_MIN_ALTARES = 6;
const DEFAULT_MIN_DISCIPULOS = 10;

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const discipleshipConfigService = {
  getMinAltaresForGrupoVida(): number {
    if (!canUseStorage()) return DEFAULT_MIN_ALTARES;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_MIN_ALTARES;
      const parsed = JSON.parse(raw);
      const val = Number(parsed.minAltaresForGrupoVida);
      return Number.isFinite(val) && val > 0 ? val : DEFAULT_MIN_ALTARES;
    } catch {
      return DEFAULT_MIN_ALTARES;
    }
  },

  setMinAltaresForGrupoVida(count: number): void {
    const val = Math.max(1, Math.floor(count));
    const current = this.getConfig();
    const data: DiscipleshipConfig = {
      ...current,
      minAltaresForGrupoVida: val,
      updatedAt: new Date().toISOString(),
    };
    this.saveConfig(data);
  },

  getMinDiscipulosForLiderCelula(): number {
    if (!canUseStorage()) return DEFAULT_MIN_DISCIPULOS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_MIN_DISCIPULOS;
      const parsed = JSON.parse(raw);
      const val = Number(parsed.minDiscipulosForLiderCelula);
      return Number.isFinite(val) && val > 0 ? val : DEFAULT_MIN_DISCIPULOS;
    } catch {
      return DEFAULT_MIN_DISCIPULOS;
    }
  },

  setMinDiscipulosForLiderCelula(count: number): void {
    const val = Math.max(1, Math.floor(count));
    const current = this.getConfig();
    const data: DiscipleshipConfig = {
      ...current,
      minDiscipulosForLiderCelula: val,
      updatedAt: new Date().toISOString(),
    };
    this.saveConfig(data);
  },

  getConfig(): DiscipleshipConfig {
    return {
      minAltaresForGrupoVida: this.getMinAltaresForGrupoVida(),
      minDiscipulosForLiderCelula: this.getMinDiscipulosForLiderCelula(),
      updatedAt: new Date().toISOString(),
    };
  },

  saveConfig(data: DiscipleshipConfig): void {
    if (canUseStorage()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage quota
      }
    }
  },
};
