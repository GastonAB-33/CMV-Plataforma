export interface StageStatsSnapshot {
  opened: number;
  finalized: number;
  interrupted: number;
  conectores?: number;
  frozenAt: string;
  frozenBy?: {
    name: string;
    role: string;
  };
}

export interface BrotherFrozenStages {
  brotherId: string;
  stage4?: StageStatsSnapshot;
  stage5?: StageStatsSnapshot;
  stage6?: StageStatsSnapshot;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_stage_frozen_stats_v1';

let memoryStore: Record<string, BrotherFrozenStages> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherFrozenStages> => {
  if (!canUseStorage()) return { ...memoryStore };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, BrotherFrozenStages>) => {
  memoryStore = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota error
    }
  }
};

export const stageFrozenStatsService = {
  getFrozenStages(brotherId: string): BrotherFrozenStages {
    if (!brotherId) {
      return { brotherId: '', updatedAt: new Date().toISOString() };
    }
    const store = readStorage();
    return store[brotherId] || { brotherId, updatedAt: new Date().toISOString() };
  },

  freezeStage4(
    brotherId: string,
    stats: Omit<StageStatsSnapshot, 'frozenAt'> & { frozenAt?: string }
  ): BrotherFrozenStages {
    if (!brotherId) return { brotherId: '', updatedAt: new Date().toISOString() };
    const store = readStorage();
    const current = store[brotherId] || { brotherId, updatedAt: new Date().toISOString() };
    const updated: BrotherFrozenStages = {
      ...current,
      stage4: {
        ...stats,
        frozenAt: stats.frozenAt || new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    store[brotherId] = updated;
    writeStorage(store);
    return updated;
  },

  freezeStage5(
    brotherId: string,
    stats: Omit<StageStatsSnapshot, 'frozenAt'> & { frozenAt?: string }
  ): BrotherFrozenStages {
    if (!brotherId) return { brotherId: '', updatedAt: new Date().toISOString() };
    const store = readStorage();
    const current = store[brotherId] || { brotherId, updatedAt: new Date().toISOString() };
    const updated: BrotherFrozenStages = {
      ...current,
      stage5: {
        ...stats,
        frozenAt: stats.frozenAt || new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    store[brotherId] = updated;
    writeStorage(store);
    return updated;
  },

  unfreezeStage4(brotherId: string): BrotherFrozenStages {
    if (!brotherId) return { brotherId: '', updatedAt: new Date().toISOString() };
    const store = readStorage();
    const current = store[brotherId] || { brotherId, updatedAt: new Date().toISOString() };
    const updated: BrotherFrozenStages = {
      ...current,
      stage4: undefined,
      updatedAt: new Date().toISOString(),
    };
    store[brotherId] = updated;
    writeStorage(store);
    return updated;
  },

  unfreezeStage5(brotherId: string): BrotherFrozenStages {
    if (!brotherId) return { brotherId: '', updatedAt: new Date().toISOString() };
    const store = readStorage();
    const current = store[brotherId] || { brotherId, updatedAt: new Date().toISOString() };
    const updated: BrotherFrozenStages = {
      ...current,
      stage5: undefined,
      updatedAt: new Date().toISOString(),
    };
    store[brotherId] = updated;
    writeStorage(store);
    return updated;
  },
};
