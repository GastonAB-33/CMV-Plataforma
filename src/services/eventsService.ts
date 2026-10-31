import { MOCK_BROTHERS, MOCK_EVENTS } from '../data/mocks/mockData';
import { canManageEventsForUser, hasPermissionAtLeastForUser } from '../lib/permissionsMatrix';
import { Cell, Event, EventType, Role, User } from '../types';
import { eventsChangeLogService } from './eventsChangeLogService';

export type PublicationKind = 'evento' | 'noticia';
export type PublicationVisibility = 'publico' | 'privado';

export interface PublicationInvolved {
  cells: Cell[];
  pastors: string[];
  disciples: string[];
}

export interface EventMediaItem {
  id: string;
  url: string;
  mediaType: 'image' | 'video';
  caption?: string;
  uploadedBy: string;
  role?: string;
  createdAt: string;
  status: 'aprobado' | 'pendiente';
  isHighlight?: boolean;
}

export interface PublicationItem {
  id: string;
  kind: PublicationKind;
  visibility: PublicationVisibility;
  title: string;
  date?: string;
  time?: string;
  text: string;
  image?: string;
  video?: string;
  mediaType?: 'image' | 'video';
  badge: string;
  involved: PublicationInvolved;
  author: string;
  createdAt: string;
  updatedAt: string;
  legacyType?: EventType;
  isLoVivido?: boolean;
  status?: 'proximo' | 'concluido';
  mediaItems?: EventMediaItem[];
}

export interface PublicationDraft {
  id?: string;
  kind: PublicationKind;
  visibility: PublicationVisibility;
  title: string;
  date?: string;
  time?: string;
  text: string;
  image?: string;
  video?: string;
  mediaType?: 'image' | 'video';
  badge: string;
  involved?: Partial<PublicationInvolved>;
  isLoVivido?: boolean;
  status?: 'proximo' | 'concluido';
  mediaItems?: EventMediaItem[];
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
    title: 'Ayuno comunitario',
    date: '2026-04-18',
    text: 'Esta semana tendremos ayuno comunitario de lunes a viernes con cierre de oracion.',
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

export const DEFAULT_WEEKLY_HIGHLIGHTS: PublicationItem[] = [
  {
    id: 'vivido-1',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Célula de Jóvenes: Clamor & Adoración',
    text: 'Noche de rendición y presencia viva de Dios con más de 50 jóvenes reunidos en unidad.',
    date: '2026-10-25',
    badge: 'Jóvenes CMV',
    video: '/cmv-event-short.mp4',
    mediaType: 'video',
    involved: normalizeInvolved({ cells: ['Vida', 'Zaeta'], pastors: ['Apostol CMV'] }),
    author: 'Equipo Juvenil',
    createdAt: '2026-10-25T20:00:00.000Z',
    updatedAt: '2026-10-25T20:00:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
  {
    id: 'vivido-2',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Bautismos & Nuevos Comienzos',
    text: 'Celebramos con alegría 12 nuevos hermanos que dieron testimonio público de su fe en Cristo.',
    date: '2026-10-24',
    badge: 'Vida Comunitaria',
    image: '/banner-hermanos.jpg',
    mediaType: 'image',
    involved: normalizeInvolved({ cells: ['Sion', 'Nissi'] }),
    author: 'Secretaría Pastoral',
    createdAt: '2026-10-24T18:00:00.000Z',
    updatedAt: '2026-10-24T18:00:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
  {
    id: 'vivido-3',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Novedades celula Zaeta',
    text: 'Esta semana la celula Zaeta tendra encuentro de bienvenida para nuevos hermanos.',
    date: '2026-10-23',
    badge: 'Zaeta',
    image: '/cmv-fellowship.jpg',
    mediaType: 'image',
    involved: normalizeInvolved({ cells: ['Zaeta'] }),
    author: 'Liderazgo Zaeta',
    createdAt: '2026-10-23T19:00:00.000Z',
    updatedAt: '2026-10-23T19:00:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
  {
    id: 'vivido-4',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Misericordia en Acción: Alimentos & Amor',
    text: 'Llegamos a familias con viandas, ropa y la palabra transformadora de esperanza en los barrios.',
    date: '2026-10-22',
    badge: 'Misericordia CMV',
    image: '/cmv-fellowship.jpg',
    mediaType: 'image',
    involved: normalizeInvolved({ cells: ['Maranata'] }),
    author: 'Ministerio de Misericordia',
    createdAt: '2026-10-22T10:00:00.000Z',
    updatedAt: '2026-10-22T10:00:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
  {
    id: 'vivido-5',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Altar Familiar & Comunión en Hogares',
    text: 'Grupos de bendición compartiendo mesas, fe y oración mutua en toda la ciudad.',
    date: '2026-10-21',
    badge: 'Hogares CMV',
    image: '/cmv-comunidad-c.jpg',
    mediaType: 'image',
    involved: normalizeInvolved({ cells: ['Vida'] }),
    author: 'Red de Células',
    createdAt: '2026-10-21T20:30:00.000Z',
    updatedAt: '2026-10-21T20:30:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
  {
    id: 'vivido-6',
    kind: 'noticia',
    visibility: 'publico',
    title: 'Escuela de Líderes & Discipulado',
    text: 'Entrenamiento dinámico para nuevos obreros y consolidadores del Reino.',
    date: '2026-10-20',
    badge: 'EDDI',
    image: '/banner-hermanos.jpg',
    mediaType: 'image',
    involved: normalizeInvolved({ cells: ['Vida', 'Sion'] }),
    author: 'Escuelas CMV',
    createdAt: '2026-10-20T19:00:00.000Z',
    updatedAt: '2026-10-20T19:00:00.000Z',
    isLoVivido: true,
    status: 'concluido',
    mediaItems: [],
  },
];

const DEFAULT_PUBLICATIONS: PublicationItem[] = [
  ...DEFAULT_WEEKLY_HIGHLIGHTS,
  {
    id: 'ev-1',
    kind: 'evento',
    visibility: 'publico',
    title: 'Noche de Avivamiento & Adoración',
    date: '2026-11-15',
    time: '19:30',
    text: 'Tiempo especial de alabanza comunitaria, palabra viva y manifestación del Espíritu Santo.',
    image: '/cmv-fellowship.jpg',
    video: '/cmv-event-short.mp4',
    mediaType: 'video',
    badge: 'Celebración General',
    involved: normalizeInvolved({ cells: ['Vida', 'Nissi', 'Zaeta', 'Sion'] }),
    author: 'Apostol Guillermo',
    createdAt: '2026-11-15T19:30:00.000Z',
    updatedAt: '2026-11-15T19:30:00.000Z',
    legacyType: EventType.RED,
    status: 'proximo',
    isLoVivido: false,
    mediaItems: [],
  },
  {
    id: 'ev-2',
    kind: 'evento',
    visibility: 'publico',
    title: 'Congreso de Jóvenes & Familias CMV',
    date: '2026-11-22',
    time: '18:00',
    text: 'Encuentro especial de comunión, visión y testimonios en un ambiente cercano, fraterno y lleno de fe.',
    image: '/cmv-novedades.jpg',
    mediaType: 'image',
    badge: 'Fuerza Joven',
    involved: normalizeInvolved({ cells: ['Zaeta', 'Sion', 'Vida'] }),
    author: 'Pastor Carlos',
    createdAt: '2026-11-22T18:00:00.000Z',
    updatedAt: '2026-11-22T18:00:00.000Z',
    legacyType: EventType.JOVENES,
    status: 'proximo',
    isLoVivido: false,
    mediaItems: [],
  },
  {
    id: 'ev-3',
    kind: 'evento',
    visibility: 'publico',
    title: 'Encuentro Red de Células de Vida',
    date: '2026-11-28',
    time: '20:00',
    text: 'Compartiendo testimonios de fe, café y oración en cada hogar, fortaleciendo el discipulado y la hermandad.',
    image: '/cmv-comunidad-c.jpg',
    mediaType: 'image',
    badge: 'Red de Células',
    involved: normalizeInvolved({ cells: ['Vida', 'Zaeta'] }),
    author: 'Pastor Carlos',
    createdAt: '2026-11-28T20:00:00.000Z',
    updatedAt: '2026-11-28T20:00:00.000Z',
    legacyType: EventType.CELULA,
    status: 'proximo',
    isLoVivido: false,
    mediaItems: [],
  },
  {
    id: 'ev-4',
    kind: 'evento',
    visibility: 'publico',
    title: 'Reunión General de Liderazgo & Discipulado',
    date: '2026-12-06',
    time: '09:00',
    text: 'Capacitación intensiva para líderes de células, anfitriones y discipuladores en formación EDEM.',
    image: '/banner-hermanos.jpg',
    mediaType: 'image',
    badge: 'Liderazgo EDEM',
    involved: normalizeInvolved({ cells: ['Maranata', 'Vida', 'Nissi', 'Zaeta', 'Sion', 'Alpha y Omega'] }),
    author: 'Apostol Guillermo',
    createdAt: '2026-12-06T09:00:00.000Z',
    updatedAt: '2026-12-06T09:00:00.000Z',
    legacyType: EventType.RED,
    status: 'proximo',
    isLoVivido: false,
    mediaItems: [],
  },
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
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_PUBLICATIONS];
    }

    // Aseguramos que existan elementos de "Lo vivido" editables si el storage guardaba versiones anteriores
    const hasVivido = parsed.some((p) => p.isLoVivido || p.id.startsWith('vivido-'));
    const combined = hasVivido ? parsed : [...DEFAULT_WEEKLY_HIGHLIGHTS, ...parsed];

    return combined.map((item) => ({
      ...item,
      isLoVivido: item.isLoVivido ?? (item.id.startsWith('vivido-') ? true : false),
      status: item.status ?? (item.kind === 'evento' ? 'proximo' : 'concluido'),
      mediaItems: Array.isArray(item.mediaItems) ? item.mediaItems : [],
      involved: normalizeInvolved(item.involved),
      mediaType: item.mediaType || (item.video ? 'video' : 'image'),
    }));
  } catch {
    return [...DEFAULT_PUBLICATIONS];
  }
};

const writePublications = (items: PublicationItem[]) => {
  const sorted = [...items].sort(byTimestampDesc);
  memoryPublications = sorted;
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cmv_events_updated'));
  }
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
  if (!hasPermissionAtLeastForUser(user, 'eventos', 'view')) {
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
    time: item.time || '19:30',
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
    return 'Debes completar el título.';
  }
  if (!draft.badge.trim()) {
    return 'Debes completar el badge / categoría.';
  }
  if (draft.kind === 'evento' && !String(draft.date ?? '').trim()) {
    return 'Para eventos la fecha es obligatoria.';
  }
  if (!draft.text.trim()) {
    return 'Debes completar la descripción.';
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

  listUpcomingEvents(user?: User): PublicationItem[] {
    const all = user ? this.listPublicationsVisibleForUser(user) : readPublications();
    const eventItems = all.filter((item) => item.kind === 'evento' && item.status !== 'concluido');

    const fallbackMedia = [
      { image: '/cmv-fellowship.jpg', video: '/cmv-event-short.mp4', mediaType: 'video' as const },
      { image: '/cmv-novedades.jpg', mediaType: 'image' as const },
      { image: '/cmv-comunidad-c.jpg', mediaType: 'image' as const },
      { image: '/banner-hermanos.jpg', mediaType: 'image' as const },
    ];

    return eventItems.map((item, idx) => {
      const fallback = fallbackMedia[idx % fallbackMedia.length];
      const hasVideo = Boolean(item.video);
      const isVideoType = item.mediaType === 'video' || (hasVideo && !item.image);
      return {
        ...item,
        mediaType: isVideoType ? 'video' : 'image',
        image: item.image || (!isVideoType ? fallback.image : ''),
        video: item.video || (isVideoType ? fallback.video || '/cmv-event-short.mp4' : undefined),
      };
    });
  },

  listCompletedEvents(user?: User): PublicationItem[] {
    const all = user ? this.listPublicationsVisibleForUser(user) : readPublications();
    return all.filter((item) => item.kind === 'evento' && item.status === 'concluido');
  },

  listLoVividoEstaSemana(user?: User): PublicationItem[] {
    const all = user ? this.listPublicationsVisibleForUser(user) : readPublications();
    
    // 1. Elementos explícitamente marcados como 'isLoVivido'
    const featured = all.filter((item) => Boolean(item.isLoVivido));

    // 2. Aportes comunitarios aprobados y marcados como highlight
    const mediaHighlights: PublicationItem[] = [];
    all.forEach((item) => {
      (item.mediaItems || []).forEach((media) => {
        if (media.status === 'aprobado' && media.isHighlight) {
          mediaHighlights.push({
            id: `media-hl-${media.id}`,
            kind: 'noticia',
            visibility: item.visibility,
            title: media.caption ? `${item.title}: ${media.caption}` : item.title,
            text: media.caption ? `Aporte de ${media.uploadedBy} en ${item.title}` : item.text,
            date: media.createdAt.slice(0, 10),
            badge: item.badge || 'Lo Vivido',
            image: media.mediaType === 'image' ? media.url : undefined,
            video: media.mediaType === 'video' ? media.url : undefined,
            mediaType: media.mediaType,
            involved: item.involved,
            author: media.uploadedBy,
            createdAt: media.createdAt,
            updatedAt: media.createdAt,
            isLoVivido: true,
            status: 'concluido',
          });
        }
      });
    });

    const combined = [...featured, ...mediaHighlights];

    if (combined.length === 0) {
      return DEFAULT_WEEKLY_HIGHLIGHTS;
    }

    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id) || seen.has(item.title)) return false;
      seen.add(item.id);
      seen.add(item.title);
      return true;
    }).slice(0, 8);
  },

  toggleLoVivido(id: string, user: User): boolean {
    const current = readPublications();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return false;

    const target = current[index];
    const newStatus = !target.isLoVivido;
    const updated = {
      ...target,
      isLoVivido: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    writePublications(next);

    eventsChangeLogService.add({
      change: newStatus ? 'Destacado en Lo Vivido' : 'Quitado de Lo Vivido',
      responsible: user.name || 'Sistema',
      details: `Publicación: "${target.title}"`,
    });

    return true;
  },

  toggleEventStatus(id: string, user: User): boolean {
    const current = readPublications();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return false;

    const target = current[index];
    const nextStatus: 'proximo' | 'concluido' = target.status === 'concluido' ? 'proximo' : 'concluido';
    const updated = {
      ...target,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    writePublications(next);

    eventsChangeLogService.add({
      change: `Estado de evento: ${nextStatus.toUpperCase()}`,
      responsible: user.name || 'Sistema',
      details: `Evento: "${target.title}"`,
    });

    return true;
  },

  addMediaToEvent(
    eventId: string,
    media: { url: string; mediaType: 'image' | 'video'; caption?: string; isHighlight?: boolean },
    user: User,
  ): EventMediaItem | null {
    const current = readPublications();
    const index = current.findIndex((item) => item.id === eventId);
    if (index === -1) return null;

    const target = current[index];
    const isAutoApproved =
      canManageEventsForUser(user) ||
      user.role === Role.SUPERADMIN ||
      user.role === Role.APOSTOL ||
      user.role === Role.PASTOR;

    const newMedia: EventMediaItem = {
      id: `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: media.url,
      mediaType: media.mediaType,
      caption: media.caption,
      uploadedBy: user.name || 'Hermano de la comunidad',
      role: user.role,
      createdAt: new Date().toISOString(),
      status: isAutoApproved ? 'aprobado' : 'pendiente',
      isHighlight: isAutoApproved ? Boolean(media.isHighlight) : false,
    };

    const updatedMediaItems = [...(target.mediaItems || []), newMedia];
    const updated: PublicationItem = {
      ...target,
      mediaItems: updatedMediaItems,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    writePublications(next);

    eventsChangeLogService.add({
      change: 'Aporte multimedia subido',
      responsible: user.name || 'Comunidad',
      details: `Evento: "${target.title}" - Aporte de ${user.name}`,
    });

    return newMedia;
  },

  updateMediaItem(
    eventId: string,
    mediaId: string,
    updates: Partial<EventMediaItem>,
    user: User,
  ): boolean {
    const current = readPublications();
    const index = current.findIndex((item) => item.id === eventId);
    if (index === -1) return false;

    const target = current[index];
    const mediaItems = target.mediaItems || [];
    const mediaIndex = mediaItems.findIndex((m) => m.id === mediaId);
    if (mediaIndex === -1) return false;

    const updatedMedia = { ...mediaItems[mediaIndex], ...updates };
    const nextMediaItems = [...mediaItems];
    nextMediaItems[mediaIndex] = updatedMedia;

    const updated: PublicationItem = {
      ...target,
      mediaItems: nextMediaItems,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    writePublications(next);

    eventsChangeLogService.add({
      change: 'Aporte multimedia actualizado',
      responsible: user.name || 'Sistema',
      details: `Evento: "${target.title}" - Item ID: ${mediaId}`,
    });

    return true;
  },

  deleteMediaItem(eventId: string, mediaId: string, user: User): boolean {
    const current = readPublications();
    const index = current.findIndex((item) => item.id === eventId);
    if (index === -1) return false;

    const target = current[index];
    const mediaItems = target.mediaItems || [];
    const nextMediaItems = mediaItems.filter((m) => m.id !== mediaId);

    const updated: PublicationItem = {
      ...target,
      mediaItems: nextMediaItems,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    writePublications(next);

    eventsChangeLogService.add({
      change: 'Aporte multimedia eliminado',
      responsible: user.name || 'Sistema',
      details: `Evento: "${target.title}"`,
    });

    return true;
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
    const video = draft.video?.trim() || '';
    const mediaType = draft.mediaType || (video ? 'video' : 'image');
    const date = draft.date?.trim() || '';
    const time = draft.time?.trim() || '';
    const isLoVivido = draft.isLoVivido !== undefined ? draft.isLoVivido : false;
    const status = draft.status || (draft.kind === 'evento' ? 'proximo' : 'concluido');

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
        time: time || undefined,
        text,
        image,
        video,
        mediaType,
        badge,
        involved,
        isLoVivido: draft.isLoVivido !== undefined ? draft.isLoVivido : base.isLoVivido,
        status: draft.status || base.status,
        mediaItems: draft.mediaItems || base.mediaItems || [],
        updatedAt: now,
      };

      const next = [...current];
      next[index] = updated;
      writePublications(next);

      eventsChangeLogService.add({
        change: `Edición de ${draft.kind}`,
        responsible: user.name || 'Sistema',
        details: `Se editó: "${title}" (${mediaType === 'video' ? 'Video 7s' : 'Foto'})`,
      });

      return { ok: true, created: false, item: updated };
    }

    const created: PublicationItem = {
      id: `pub-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      kind: draft.kind,
      visibility: draft.visibility,
      title,
      date: date || undefined,
      time: time || undefined,
      text,
      image,
      video,
      mediaType,
      badge,
      involved,
      author: user.name || buildAuthorFallback(),
      createdAt: now,
      updatedAt: now,
      legacyType: draft.kind === 'evento' ? EventType.RED : undefined,
      isLoVivido,
      status,
      mediaItems: [],
    };

    writePublications([...current, created]);

    eventsChangeLogService.add({
      change: `Creación de ${draft.kind}`,
      responsible: user.name || 'Sistema',
      details: `Se publicó: "${title}" (${mediaType === 'video' ? 'Video 7s' : 'Foto'})`,
    });

    return { ok: true, created: true, item: created };
  },

  deletePublication(id: string, user: User): boolean {
    const current = readPublications();
    const target = current.find((item) => item.id === id);
    if (!target) {
      return false;
    }

    const next = current.filter((item) => item.id !== id);
    writePublications(next);

    eventsChangeLogService.add({
      change: `Eliminación de ${target.kind}`,
      responsible: user.name || 'Sistema',
      details: `Se eliminó: "${target.title}"`,
    });

    return true;
  },

  canManageForUser(user: User): boolean {
    return canManageEventsForUser(user);
  },
};
