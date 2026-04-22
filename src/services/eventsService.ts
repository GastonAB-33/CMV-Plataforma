import { MOCK_BROTHERS, MOCK_EVENTS } from '../data/mocks';
import { canManageEvents, hasPermissionAtLeast } from '../lib/permissionsMatrix';
import { Cell, Event, EventType, Role, User } from '../types';

export type PublicationKind = 'evento' | 'noticia';
export type PublicationVisibility = 'publico' | 'privado';

export interface PublicationInvolved {
  cells: Cell[];
  pastors: string[];
  disciples: string[];
}

export interface PublicationItem {
  id: string;
  kind: PublicationKind;
  visibility: PublicationVisibility;
  title: string;
  date?: string;
  text: string;
  image?: string;
  badge: string;
  involved: PublicationInvolved;
  author: string;
  createdAt: string;
  updatedAt: string;
  legacyType?: EventType;
}

export interface PublicationDraft {
  id?: string;
  kind: PublicationKind;
  visibility: PublicationVisibility;
  title: string;
  date?: string;
  text: string;
  image?: string;
  badge: string;
  involved?: Partial<PublicationInvolved>;
}

export interface UpsertPublicationResult {
  ok: boolean;
  created: boolean;
  item?: PublicationItem;
  error?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  author: string;
  targetCell?: Cell;
}

export interface VisibleEvent extends Event {
  isInvitedForCurrentUser: boolean;
}

const STORAGE_KEY = 'cmv_events_publications_v2';

let memoryPublications: PublicationItem[] = [];

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeInvolved = (input?: Partial<PublicationInvolved>): PublicationInvolved => ({
  cells: Array.from(new Set((input?.cells ?? []).filter(Boolean))),
  pastors: Array.from(new Set((input?.pastors ?? []).map((value) => value.trim()).filter(Boolean))),
  disciples: Array.from(new Set((input?.disciples ?? []).map((value) => value.trim()).filter(Boolean))),
});

const DEFAULT_NEWS: PublicationItem[] = [
  {
    id: 'news-1',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Ayuno congregacional',
    date: '2026-04-18',
    text: 'Esta semana tendremos ayuno congregacional de lunes a viernes con cierre de oracion.',
    badge: 'Comunicado',
    image: '',
    involved: normalizeInvolved(),
    author: 'Pastor Carlos',
    createdAt: '2026-04-18T09:00:00.000Z',
    updatedAt: '2026-04-18T09:00:00.000Z',
  },
  {
    id: 'news-2',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Capacitacion lideres de celula',
    date: '2026-04-16',
    text: 'Se abre jornada de capacitacion para lideres y discipulos en formacion.',
    badge: 'Formacion',
    image: '',
    involved: normalizeInvolved(),
    author: 'Apostol Guillermo',
    createdAt: '2026-04-16T14:00:00.000Z',
    updatedAt: '2026-04-16T14:00:00.000Z',
  },
  {
    id: 'news-3',
    kind: 'noticia',
    visibility: 'privado',
    title: 'Novedades celula Zaeta',
    date: '2026-04-15',
    text: 'Esta semana la celula Zaeta tendra encuentro de bienvenida para nuevos hermanos.',
    badge: 'Celula',
    image: '',
    involved: normalizeInvolved({ cells: ['Zaeta'] }),
    author: 'Pastor Carlos',
    createdAt: '2026-04-15T19:30:00.000Z',
    updatedAt: '2026-04-15T19:30:00.000Z',
  },
];

const DEFAULT_PUBLICATIONS: PublicationItem[] = [
  ...MOCK_EVENTS.map((event) => ({
    id: event.id,
    kind: 'evento' as const,
    visibility: 'publico' as const,
    title: event.title,
    date: event.date,
    text: '',
    image: '',
    badge: event.type,
    involved: normalizeInvolved({
      cells: [event.organizerCell, ...(event.invitedCells ?? [])],
    }),
    author: 'Sistema',
    createdAt: `${event.date}T${event.time || '00:00'}:00.000Z`,
    updatedAt: `${event.date}T${event.time || '00:00'}:00.000Z`,
    legacyType: event.type,
  })),
  ...DEFAULT_NEWS,
];

const byTimestampDesc = (left: PublicationItem, right: PublicationItem) =>
  toSortTimestamp(right) - toSortTimestamp(left);

const toSortTimestamp = (item: Pick<PublicationItem, 'kind' | 'date' | 'updatedAt' | 'createdAt'>): number => {
  if (item.kind === 'evento' && item.date) {
    const dateTimestamp = Date.parse(`${item.date}T00:00:00`);
    if (!Number.isNaN(dateTimestamp)) {
      return dateTimestamp;
    }
  }

  if (item.date) {
    const maybeDate = Date.parse(item.date);
    if (!Number.isNaN(maybeDate)) {
      return maybeDate;
    }
  }

  const updatedTimestamp = Date.parse(item.updatedAt);
  if (!Number.isNaN(updatedTimestamp)) {
    return updatedTimestamp;
  }

  const createdTimestamp = Date.parse(item.createdAt);
  return Number.isNaN(createdTimestamp) ? 0 : createdTimestamp;
};

const readPublications = (): PublicationItem[] => {
  if (!canUseStorage()) {
    if (memoryPublications.length === 0) {
      memoryPublications = [...DEFAULT_PUBLICATIONS];
    }
    return [...memoryPublications];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [...DEFAULT_PUBLICATIONS];
  }

  try {
    const parsed = JSON.parse(raw) as PublicationItem[];
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_PUBLICATIONS];
    }
    return parsed.map((item) => ({
      ...item,
      involved: normalizeInvolved(item.involved),
    }));
  } catch {
    return [...DEFAULT_PUBLICATIONS];
  }
};

const writePublications = (items: PublicationItem[]) => {
  const sorted = [...items].sort(byTimestampDesc);
  memoryPublications = sorted;
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
};

const resolveUserCells = (user: User): Set<Cell> => {
  const cells = new Set<Cell>();
  if (user.primaryCell) {
    cells.add(user.primaryCell);
  }
  for (const cell of user.coveredCells ?? []) {
    cells.add(cell);
  }
  return cells;
};

const isPrivatePublicationVisibleForUser = (item: PublicationItem, user: User): boolean => {
  if (item.author === user.name) {
    return true;
  }

  const userCells = resolveUserCells(user);
  if (item.involved.cells.some((cell) => userCells.has(cell))) {
    return true;
  }

  if (item.involved.pastors.includes(user.name)) {
    return true;
  }

  if (item.involved.disciples.includes(user.name)) {
    return true;
  }

  return false;
};

const isPublicationVisibleForUser = (item: PublicationItem, user: User): boolean => {
  if (!hasPermissionAtLeast(user.role, 'eventos', 'view')) {
    return false;
  }

  if (user.role === Role.APOSTOL) {
    return true;
  }

  if (item.visibility === 'publico') {
    return true;
  }

  return isPrivatePublicationVisibleForUser(item, user);
};

const parseIsoDateTime = (value?: string): number => {
  if (!value) {
    return 0;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const inferLegacyEventType = (item: PublicationItem): EventType => {
  if (item.legacyType) {
    return item.legacyType;
  }
  const badgeText = item.badge.toLowerCase();
  if (badgeText.includes('joven')) {
    return EventType.JOVENES;
  }
  if (item.involved.cells.length <= 1) {
    return EventType.CELULA;
  }
  return EventType.RED;
};

const toLegacyEvent = (item: PublicationItem, user: User): VisibleEvent => {
  const organizerCell = item.involved.cells[0] ?? user.primaryCell ?? 'Vida';
  const invitedCells = item.involved.cells.filter((cell) => cell !== organizerCell);
  const isInvitedForCurrentUser =
    item.visibility === 'privado' &&
    isPrivatePublicationVisibleForUser(item, user) &&
    item.author !== user.name;

  return {
    id: item.id,
    title: item.title,
    type: inferLegacyEventType(item),
    date: item.date ?? item.createdAt.slice(0, 10),
    time: '19:30',
    cell: item.involved.cells.length > 0 ? item.involved.cells.join(' / ') : 'General',
    organizerCell,
    invitedCells,
    isInvitedForCurrentUser,
  };
};

const toLegacyNews = (item: PublicationItem): NewsItem => ({
  id: item.id,
  title: item.title,
  body: item.text,
  publishedAt: item.date
    ? `${item.date}T00:00:00.000Z`
    : item.updatedAt,
  author: item.author,
  targetCell: item.visibility === 'privado' ? item.involved.cells[0] : undefined,
});

const validateDraft = (draft: PublicationDraft): string | null => {
  if (!draft.title.trim()) {
    return 'Debes completar el titulo.';
  }
  if (!draft.badge.trim()) {
    return 'Debes completar el badge.';
  }
  if (draft.kind === 'evento' && !String(draft.date ?? '').trim()) {
    return 'Para eventos la fecha es obligatoria.';
  }
  if (!draft.text.trim()) {
    return 'Debes completar el texto.';
  }

  if (draft.visibility === 'privado' && draft.kind === 'evento') {
    const involved = normalizeInvolved(draft.involved);
    const hasInvolved =
      involved.cells.length > 0 || involved.pastors.length > 0 || involved.disciples.length > 0;
    if (!hasInvolved) {
      return 'Para eventos privados debes seleccionar al menos un involucrado.';
    }
  }

  return null;
};

const buildAuthorFallback = (): string => {
  const firstPastor = MOCK_BROTHERS.find((brother) => brother.role === Role.PASTOR);
  return firstPastor?.name ?? 'Sistema';
};

export const eventsService = {
  list(): Event[] {
    const all = readPublications().filter((item) => item.kind === 'evento');
    return all.map((item) =>
      toLegacyEvent(item, {
        id: 'system',
        name: 'Sistema',
        role: Role.APOSTOL,
      }),
    );
  },

  listPublicationsVisibleForUser(user: User): PublicationItem[] {
    return readPublications()
      .filter((item) => isPublicationVisibleForUser(item, user))
      .sort(byTimestampDesc);
  },

  listVisibleForUser(user: User): VisibleEvent[] {
    return this.listPublicationsVisibleForUser(user)
      .filter((item) => item.kind === 'evento')
      .map((item) => toLegacyEvent(item, user))
      .sort((left, right) => {
        const leftTime = parseIsoDateTime(`${left.date}T${left.time || '00:00'}:00`);
        const rightTime = parseIsoDateTime(`${right.date}T${right.time || '00:00'}:00`);
        return leftTime - rightTime;
      });
  },

  listNewsVisibleForUser(user: User): NewsItem[] {
    return this.listPublicationsVisibleForUser(user)
      .filter((item) => item.kind === 'noticia')
      .map(toLegacyNews)
      .sort((left, right) => parseIsoDateTime(right.publishedAt) - parseIsoDateTime(left.publishedAt));
  },

  upsertPublication(draft: PublicationDraft, user: User): UpsertPublicationResult {
    const validationError = validateDraft(draft);
    if (validationError) {
      return { ok: false, created: false, error: validationError };
    }

    const now = new Date().toISOString();
    const current = readPublications();
    const involved = normalizeInvolved(draft.involved);
    const title = draft.title.trim();
    const text = draft.text.trim();
    const badge = draft.badge.trim();
    const image = draft.image?.trim() || '';
    const date = draft.date?.trim() || '';

    if (draft.id) {
      const index = current.findIndex((item) => item.id === draft.id);
      if (index === -1) {
        return { ok: false, created: false, error: 'No se encontro la publicacion a editar.' };
      }

      const base = current[index];
      const updated: PublicationItem = {
        ...base,
        kind: draft.kind,
        visibility: draft.visibility,
        title,
        date: date || undefined,
        text,
        image,
        badge,
        involved,
        updatedAt: now,
      };

      const next = [...current];
      next[index] = updated;
      writePublications(next);
      return { ok: true, created: false, item: updated };
    }

    const created: PublicationItem = {
      id: `pub-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      kind: draft.kind,
      visibility: draft.visibility,
      title,
      date: date || undefined,
      text,
      image,
      badge,
      involved,
      author: user.name || buildAuthorFallback(),
      createdAt: now,
      updatedAt: now,
      legacyType: draft.kind === 'evento' ? EventType.RED : undefined,
    };

    writePublications([...current, created]);
    return { ok: true, created: true, item: created };
  },

  canManageForUser(user: User): boolean {
    return canManageEvents(user.role);
  },
};
