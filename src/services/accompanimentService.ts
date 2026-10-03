export interface BrotherAccompanimentData {
  brotherId: string;
  liderCelulaName?: string;
  liderCelulaId?: string;
  liderIsMatrimonio?: boolean;
  liderMatrimonioId?: string;
  acompananteName?: string;
  acompananteId?: string;
  acompananteIsMatrimonio?: boolean;
  acompananteMatrimonioId?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_brother_accompaniments_v1';

let memoryAccompaniments: Record<string, BrotherAccompanimentData> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherAccompanimentData> => {
  if (!canUseStorage()) {
    return { ...memoryAccompaniments };
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

const writeStorage = (data: Record<string, BrotherAccompanimentData>) => {
  memoryAccompaniments = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignorar quota
    }
  }
};

export const accompanimentService = {
  getAccompaniment(brotherId: string): BrotherAccompanimentData | undefined {
    if (!brotherId) return undefined;
    const data = readStorage();
    return data[brotherId] ? { ...data[brotherId] } : undefined;
  },

  saveAccompaniment(
    brotherId: string,
    updates: Partial<Omit<BrotherAccompanimentData, 'brotherId' | 'updatedAt'>>,
  ): BrotherAccompanimentData {
    const data = readStorage();
    const current = data[brotherId] ?? {
      brotherId,
      updatedAt: new Date().toISOString(),
    };

    const next: BrotherAccompanimentData = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = next;
    writeStorage(data);
    return next;
  },
};
