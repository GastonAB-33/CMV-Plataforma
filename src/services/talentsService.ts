const STORAGE_KEY = 'cmv_brother_talents_text_v1';

export interface BrotherTalentEntry {
  brotherId: string;
  text: string;
  updatedAt: string;
}

let memoryTalents: Record<string, BrotherTalentEntry> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherTalentEntry> => {
  if (!canUseStorage()) {
    return { ...memoryTalents };
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

const writeStorage = (data: Record<string, BrotherTalentEntry>) => {
  memoryTalents = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignorar cuotas de storage
    }
  }
};

export const talentsService = {
  getTalents(brotherId: string): string {
    if (!brotherId) return '';
    const data = readStorage();
    return data[brotherId]?.text || '';
  },

  saveTalents(brotherId: string, text: string): BrotherTalentEntry {
    const data = readStorage();
    const entry: BrotherTalentEntry = {
      brotherId,
      text: text.trim(),
      updatedAt: new Date().toISOString(),
    };

    data[brotherId] = entry;
    writeStorage(data);
    return entry;
  },

  deleteTalents(brotherId: string): void {
    const data = readStorage();
    delete data[brotherId];
    writeStorage(data);
  },
};
