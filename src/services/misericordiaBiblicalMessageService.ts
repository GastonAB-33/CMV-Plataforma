export interface MisericordiaBiblicalMessage {
  id: string;
  title: string;
  verseReference: string;
  verseText: string;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = 'cmv_misericordia_biblical_messages_v1';

const SEED_MESSAGES: MisericordiaBiblicalMessage[] = [
  {
    id: 'seed-msg-1',
    title: 'Compasion en accion',
    verseReference: 'Mateo 25:35',
    verseText: 'Porque tuve hambre, y me disteis de comer; tuve sed, y me disteis de beber.',
    note: 'Unir alimento con palabra y acompanamiento.',
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'seed-msg-2',
    title: 'Esperanza para las calles',
    verseReference: 'Romanos 15:13',
    verseText: 'El Dios de esperanza os llene de todo gozo y paz en el creer.',
    note: 'Orar por cada persona durante el reparto.',
    createdAt: '2026-04-02T00:00:00.000Z',
  },
];

let memoryEntries: MisericordiaBiblicalMessage[] = [...SEED_MESSAGES];

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeEntry = (entry: MisericordiaBiblicalMessage): MisericordiaBiblicalMessage => ({
  id: entry.id,
  title: entry.title.trim(),
  verseReference: entry.verseReference.trim(),
  verseText: entry.verseText.trim(),
  note: entry.note?.trim() || undefined,
  createdAt: entry.createdAt || new Date().toISOString(),
});

const readEntries = (): MisericordiaBiblicalMessage[] => {
  if (!canUseStorage()) {
    return [...memoryEntries];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MESSAGES));
    return [...SEED_MESSAGES];
  }

  try {
    const parsed = JSON.parse(raw) as MisericordiaBiblicalMessage[];
    if (!Array.isArray(parsed)) {
      return [...SEED_MESSAGES];
    }
    return parsed.map(normalizeEntry);
  } catch {
    return [...SEED_MESSAGES];
  }
};

const writeEntries = (entries: MisericordiaBiblicalMessage[]) => {
  memoryEntries = [...entries];
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const byCreatedAtDesc = (a: MisericordiaBiblicalMessage, b: MisericordiaBiblicalMessage) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const misericordiaBiblicalMessageService = {
  list(): MisericordiaBiblicalMessage[] {
    return readEntries().sort(byCreatedAtDesc);
  },

  add(input: Omit<MisericordiaBiblicalMessage, 'id' | 'createdAt'>): MisericordiaBiblicalMessage {
    const nextEntry = normalizeEntry({
      id: `bm-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      ...input,
    });
    const next = [nextEntry, ...readEntries()].sort(byCreatedAtDesc);
    writeEntries(next);
    return nextEntry;
  },
};

