export interface Marriage {
  id: string;
  label: string;
  spouse1Id: string;
  spouse1Name: string;
  spouse2Id: string;
  spouse2Name: string;
  createdAt: string;
}

export interface CreateMarriageInput {
  spouse1Id: string;
  spouse1Name: string;
  spouse2Id: string;
  spouse2Name: string;
  label?: string;
}

const STORAGE_KEY = 'CMV_PLATAFORMA_MARRIAGES';

const getInitialData = (): Marriage[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let marriagesCache: Marriage[] = getInitialData();
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const saveToStorage = (data: Marriage[]) => {
  marriagesCache = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }
  notify();
};

export const marriagesService = {
  list(): Marriage[] {
    return [...marriagesCache];
  },

  findById(id: string): Marriage | undefined {
    return marriagesCache.find((m) => m.id === id);
  },

  findBySpouseId(brotherId: string): Marriage | undefined {
    return marriagesCache.find(
      (m) => m.spouse1Id === brotherId || m.spouse2Id === brotherId,
    );
  },

  create(input: CreateMarriageInput): { ok: boolean; marriage?: Marriage; error?: string } {
    if (!input.spouse1Id || !input.spouse2Id) {
      return { ok: false, error: 'Se requieren ambos cónyuges.' };
    }

    if (input.spouse1Id === input.spouse2Id) {
      return { ok: false, error: 'Los cónyuges deben ser personas diferentes.' };
    }

    const existing1 = this.findBySpouseId(input.spouse1Id);
    if (existing1) {
      return {
        ok: false,
        error: `${input.spouse1Name} ya está registrado/a en el matrimonio "${existing1.label}".`,
      };
    }

    const existing2 = this.findBySpouseId(input.spouse2Id);
    if (existing2) {
      return {
        ok: false,
        error: `${input.spouse2Name} ya está registrado/a en el matrimonio "${existing2.label}".`,
      };
    }

    const defaultLabel = `Matrimonio ${input.spouse1Name.split(' ').pop()} y ${input.spouse2Name.split(' ').pop()}`;
    const newMarriage: Marriage = {
      id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: input.label?.trim() || defaultLabel,
      spouse1Id: input.spouse1Id,
      spouse1Name: input.spouse1Name,
      spouse2Id: input.spouse2Id,
      spouse2Name: input.spouse2Name,
      createdAt: new Date().toISOString(),
    };

    saveToStorage([newMarriage, ...marriagesCache]);
    return { ok: true, marriage: newMarriage };
  },

  delete(id: string): boolean {
    const next = marriagesCache.filter((m) => m.id !== id);
    if (next.length !== marriagesCache.length) {
      saveToStorage(next);
      return true;
    }
    return false;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
