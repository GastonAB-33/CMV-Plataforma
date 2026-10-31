import {
  Calendar,
  ChevronDown,
  Filter,
  History,
  Newspaper,
  Plus,
  Tag,
  Users,
  Video,
  Camera,
  Trash2,
  Film,
  Clock,
  Sparkles,
  Star,
  CheckCircle2,
  Image as ImageIcon,
  HeartHandshake,
  ArrowRight,
  MessageSquare,
  SlidersHorizontal,
  Check,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeProvider';
import { brothersService } from '../../services/brothersService';
import { eventsChangeLogService } from '../../services/eventsChangeLogService';
import { eventsService, PublicationDraft, PublicationItem } from '../../services/eventsService';
import { Cell, Role } from '../../types';
import { UploadEventMediaModal } from './components/UploadEventMediaModal';
import { EventMediaGalleryModal } from './components/EventMediaGalleryModal';
import { ConcludeEventModal } from './components/ConcludeEventModal';

type ToastType = 'success' | 'error';
type ContentFilter = 'eventos' | 'noticias';
type VisibilityFilter = 'publico' | 'privado';
export type MainEventTab = 'proximos' | 'vivido' | 'noticias' | 'todos';

interface PublicationFormState {
  kind: 'evento' | 'noticia';
  visibility: 'publico' | 'privado';
  title: string;
  date: string;
  time?: string;
  text: string;
  image: string;
  video?: string;
  mediaType: 'image' | 'video';
  badge: string;
  involvedCells: Cell[];
  involvedPastors: string[];
  involvedDisciples: string[];
  isLoVivido: boolean;
  status: 'proximo' | 'concluido';
}

const emptyForm = (): PublicationFormState => ({
  kind: 'evento',
  visibility: 'publico',
  title: '',
  date: '',
  time: '',
  text: '',
  image: '',
  video: '',
  mediaType: 'image',
  badge: '',
  involvedCells: [],
  involvedPastors: [],
  involvedDisciples: [],
  isLoVivido: false,
  status: 'proximo',
});

const formatDateLabel = (value?: string): string => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(parsed);
};

const formatDateTimeForLog = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const toggleSelection = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const buildDraftFromForm = (
  form: PublicationFormState,
  editingId: string | null,
): PublicationDraft => ({
  id: editingId ?? undefined,
  kind: form.kind,
  visibility: form.visibility,
  title: form.title,
  date: form.date,
  time: form.time || undefined,
  text: form.text,
  image: form.mediaType === 'image' ? form.image : undefined,
  video: form.mediaType === 'video' ? form.video : undefined,
  mediaType: form.mediaType,
  badge: form.badge,
  isLoVivido: form.isLoVivido,
  status: form.status,
  involved: {
    cells: form.involvedCells,
    pastors: form.involvedPastors,
    disciples: form.involvedDisciples,
  },
});

const buildFormFromPublication = (item: PublicationItem): PublicationFormState => ({
  kind: item.kind,
  visibility: item.visibility,
  title: item.title,
  date: item.date ?? '',
  time: item.time ?? '',
  text: item.text,
  image: item.image ?? '',
  video: item.video ?? '',
  mediaType: item.mediaType ?? (item.video ? 'video' : 'image'),
  badge: item.badge,
  involvedCells: item.involved.cells,
  involvedPastors: item.involved.pastors,
  involvedDisciples: item.involved.disciples,
  isLoVivido: Boolean(item.isLoVivido),
  status: item.status || (item.kind === 'evento' ? 'proximo' : 'concluido'),
});

export const EventsPage = () => {
  const { user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [contentFilters, setContentFilters] = useState<ContentFilter[]>([
    'eventos',
    'noticias',
  ]);
  const [visibilityFilters, setVisibilityFilters] = useState<VisibilityFilter[]>([
    'publico',
    'privado',
  ]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isMobileFiltersModalOpen, setIsMobileFiltersModalOpen] = useState(false);
  const [expandedPublicationId, setExpandedPublicationId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PublicationFormState>(emptyForm);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab');
  const currentTab: MainEventTab =
    currentTabParam === 'vivido' ||
    currentTabParam === 'noticias' ||
    currentTabParam === 'todos'
      ? currentTabParam
      : 'proximos';

  const setTab = (tab: MainEventTab) => {
    setSearchParams(tab === 'proximos' ? {} : { tab });
  };

  const [uploadModalEvent, setUploadModalEvent] = useState<PublicationItem | null>(null);
  const [galleryModalEvent, setGalleryModalEvent] = useState<PublicationItem | null>(null);
  const [concludeModalEvent, setConcludeModalEvent] = useState<PublicationItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const canManageEvents = useMemo(() => eventsService.canManageForUser(user), [user]);

  const publications = useMemo(
    () => eventsService.listPublicationsVisibleForUser(user),
    [user, refreshKey],
  );

  const loVividoItems = useMemo(
    () => eventsService.listLoVividoEstaSemana(user),
    [user, refreshKey],
  );

  const upcomingEvents = useMemo(
    () => publications.filter((item) => item.kind === 'evento' && item.status !== 'concluido'),
    [publications],
  );

  const completedEvents = useMemo(
    () => publications.filter((item) => item.kind === 'evento' && item.status === 'concluido'),
    [publications],
  );

  const filteredFeed = useMemo(() => {
    return publications.filter((item) => {
      const contentMatch =
        (item.kind === 'evento' && contentFilters.includes('eventos')) ||
        (item.kind === 'noticia' && contentFilters.includes('noticias'));
      const visibilityMatch = visibilityFilters.includes(item.visibility);
      return contentMatch && visibilityMatch;
    });
  }, [publications, contentFilters, visibilityFilters]);

  const handleToggleLoVivido = (item: PublicationItem) => {
    if (!canManageEvents) return;
    eventsService.toggleLoVivido(item.id, user);
    setRefreshKey((previous) => previous + 1);
    showToast(
      !item.isLoVivido
        ? `"${item.title}" agregada a Lo Vivido en portada.`
        : `"${item.title}" quitada de la portada.`,
      'success',
    );
  };

  const handleToggleEventStatus = (item: PublicationItem) => {
    if (!canManageEvents) return;
    eventsService.toggleEventStatus(item.id, user);
    setRefreshKey((previous) => previous + 1);
    showToast(
      item.status === 'concluido'
        ? `Evento "${item.title}" marcado como Próximo`
        : `Evento "${item.title}" marcado como Concluido (ya sucedió)`,
      'success',
    );
  };

  const handleConcludeAndUpload = (item: PublicationItem) => {
    setConcludeModalEvent(item);
  };

  const logs = useMemo(() => eventsChangeLogService.list(), [refreshKey]);
  const eventsCount = useMemo(
    () => publications.filter((item) => item.kind === 'evento').length,
    [publications],
  );
  const newsCount = useMemo(
    () => publications.filter((item) => item.kind === 'noticia').length,
    [publications],
  );

  const allCells = useMemo(() => brothersService.listCells(), []);

  const brothers = useMemo(() => brothersService.list(), []);

  const pastorOptions = useMemo(
    () =>
      brothers
        .filter((brother) => brother.role === Role.PASTOR || brother.role === Role.APOSTOL)
        .map((brother) => brother.name),
    [brothers],
  );

  const discipuloOptions = useMemo(
    () =>
      brothers
        .filter((brother) => brother.role === Role.DISCIPULO)
        .map((brother) => brother.name),
    [brothers],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsEditorOpen(true);
  };

  const isAllFiltersSelected = useMemo(
    () =>
      contentFilters.length === 2 &&
      visibilityFilters.length === 2,
    [contentFilters, visibilityFilters],
  );
  const activeFilterCount = contentFilters.length + visibilityFilters.length;

  const enableAllFilters = () => {
    setContentFilters(['eventos', 'noticias']);
    setVisibilityFilters(['publico', 'privado']);
  };

  useEffect(() => {
    setExpandedPublicationId(null);
  }, [contentFilters, visibilityFilters]);

  const toggleContentFilter = (value: ContentFilter) => {
    setContentFilters((previous) => {
      if (previous.includes(value)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((item) => item !== value);
      }
      return [...previous, value];
    });
  };

  const toggleVisibilityFilter = (value: VisibilityFilter) => {
    setVisibilityFilters((previous) => {
      if (previous.includes(value)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((item) => item !== value);
      }
      return [...previous, value];
    });
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((previous) => ({ ...previous, image: result, mediaType: 'image' }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((previous) => ({ ...previous, video: result, mediaType: 'video' }));
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (item: PublicationItem) => {
    if (!canManageEvents) {
      return;
    }
    setEditingId(item.id);
    setForm(buildFormFromPublication(item));
    setIsEditorOpen(true);
  };

  const handleDeletePublication = (item: PublicationItem) => {
    if (!canManageEvents) {
      return;
    }
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar "${item.title}"?`);
    if (!confirmed) {
      return;
    }
    const success = eventsService.deletePublication(item.id, user);
    if (!success) {
      showToast('No se pudo eliminar la publicación', 'error');
      return;
    }
    setRefreshKey((previous) => previous + 1);
    showToast('Publicación eliminada correctamente.', 'success');
  };

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const savePublication = () => {
    const draft = buildDraftFromForm(form, editingId);
    const result = eventsService.upsertPublication(draft, user);

    if (!result.ok || !result.item) {
      showToast(result.error ?? 'No se pudo guardar la publicacion.', 'error');
      return;
    }

    eventsChangeLogService.add({
      change: result.created ? 'Publicacion creada' : 'Publicacion actualizada',
      responsible: user.name,
      details: `${result.item.kind.toUpperCase()} - ${result.item.title} (${result.item.visibility})`,
    });

    setIsEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setRefreshKey((previous) => previous + 1);
    showToast(result.created ? 'Publicacion creada.' : 'Publicacion actualizada.', 'success');
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6 pb-16">
      {/* =========================================================================
          HERO HEADER RESPONSIVO: OBSIDIANA, ESMERALDA #00dfa2 Y ORO #c5a059
         ========================================================================= */}
      <header className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#071612]/95 via-[#0b1d17]/90 to-[#07120e]/95 border border-emerald-500/25 p-4 sm:p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Resplandores ambientales de fondo contenidos sin desborde */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#00dfa2]/15 via-[#06b6d4]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-[#c5a059]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full max-w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#00dfa2] text-xs sm:text-sm font-black uppercase tracking-wider mb-2.5 max-w-full">
              <Sparkles size={15} className="shrink-0 text-[#00dfa2]" />
              <span className="whitespace-nowrap">Agenda y Acontecimientos Semanales</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              EVENTO Y EXPERIENCIAS MV
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mt-1.5 leading-relaxed">
              Carga y administración unificada de próximos eventos en agenda, carrusel dinámico "Lo Vivido Esta Semana" y aportes comunitarios de fotos y testimonios.
            </p>

            {/* Badges de conteo rápido ampliados con degradé oficial de la plataforma */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-bold shadow-md">
                <Calendar size={18} className="text-cyan-400 shrink-0" />
                <span>Próximos: <strong className="text-white font-black text-sm sm:text-base ml-1">{upcomingEvents.length}</strong></span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-[#00dfa2] text-xs sm:text-sm font-bold shadow-md">
                <Star size={18} className="fill-[#00dfa2] text-[#00dfa2] shrink-0" />
                <span>En Portada: <strong className="text-white font-black text-sm sm:text-base ml-1">{loVividoItems.length}</strong></span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#071612] to-teal-950/90 border border-emerald-500/40 text-[#00dfa2] text-xs sm:text-sm font-bold shadow-md">
                <Camera size={18} className="text-[#00dfa2] shrink-0" />
                <span>Lo Vivido: <strong className="text-white font-black text-sm sm:text-base ml-1">{completedEvents.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Botones de acción directos: Ampliados, legibles y ordenados en móvil y desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto shrink-0 mt-3 xl:mt-0">
            {canManageEvents ? (
              <>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#c5a059] to-[#d4b375] hover:brightness-110 text-slate-950 font-black uppercase text-sm sm:text-base tracking-wider rounded-2xl shadow-xl shadow-[#c5a059]/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={22} className="shrink-0 text-slate-950 stroke-[3]" />
                  <span className="text-slate-950 font-black">Crear Evento / Noticia</span>
                </button>

                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm tracking-wider rounded-2xl border border-white/15 transition-all active:scale-95 cursor-pointer"
                    title="Configuración de tema y módulo"
                  >
                    <Settings size={18} className="text-[#00dfa2] shrink-0" />
                    <span>Configuración</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsChangeLogOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs sm:text-sm tracking-wider rounded-2xl border border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <History size={18} className="text-slate-400 shrink-0" />
                    <span>Auditoría</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm tracking-wider rounded-2xl border border-white/15 transition-all active:scale-95 cursor-pointer"
              >
                <Settings size={18} className="text-[#00dfa2]" />
                <span>Apariencia (Claro / Oscuro)</span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            BARRA DE PESTAÑAS RESPONSIVA (SIN DESBORDE HORIZONTAL)
           ========================================================================= */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 w-full max-w-full min-w-0 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1.5">
          <button
            type="button"
            onClick={() => setTab('proximos')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'proximos'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 border border-cyan-400 font-black'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Calendar size={16} />
            <span>Próximos Eventos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'proximos' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'
              }`}
            >
              {upcomingEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('vivido')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'vivido'
                ? 'bg-gradient-to-r from-emerald-500 to-[#00dfa2] text-black shadow-lg shadow-emerald-500/30 ring-2 ring-[#00dfa2]/60 font-black'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00dfa2] border border-emerald-500/30'
            }`}
          >
            <Sparkles size={16} className={currentTab === 'vivido' ? 'text-black' : 'text-[#00dfa2]'} />
            <span>Lo Vivido Esta Semana</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'vivido' ? 'bg-black/25 text-black' : 'bg-emerald-500/20 text-[#00dfa2]'
              }`}
            >
              {loVividoItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('noticias')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'noticias'
                ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/30 border border-[#c5a059] font-black'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Newspaper size={16} />
            <span>Noticias y Comunicados</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'noticias' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'
              }`}
            >
              {newsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('todos')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'todos'
                ? 'bg-slate-700 text-white shadow-lg border border-slate-500 font-black'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <span>Todas las publicaciones</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                currentTab === 'todos' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {publications.length}
            </span>
          </button>
        </div>

        {/* Subfiltros activos para Todas las publicaciones o Noticias */}
        {(currentTab === 'todos' || currentTab === 'noticias') && (
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-3 border-t border-white/5 w-full">
            <button
              onClick={enableAllFilters}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                isAllFiltersSelected
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => toggleContentFilter('eventos')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                contentFilters.includes('eventos')
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Solo Eventos
            </button>
            <button
              onClick={() => toggleContentFilter('noticias')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                contentFilters.includes('noticias')
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Solo Noticias
            </button>
            <button
              onClick={() => toggleVisibilityFilter('publico')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                visibilityFilters.includes('publico')
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Públicos
            </button>
            <button
              onClick={() => toggleVisibilityFilter('privado')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                visibilityFilters.includes('privado')
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Privados
            </button>
          </div>
        )}
      </header>

      {/* =========================================================================
          VISTA 1: LO VIVIDO ESTA SEMANA
         ========================================================================= */}
      {currentTab === 'vivido' && (
        <div className="space-y-10 w-full max-w-full min-w-0">
          {/* SECCIÓN 1: MOMENTOS EN ROTACIÓN ACTIVA (PANTALLA DE INICIO) */}
          <section className="space-y-4 w-full max-w-full min-w-0">
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#071612] to-black/80 border border-emerald-500/35 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl w-full max-w-full">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#00dfa2] text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-[#00dfa2]" />
                  <span>En Rotación Principal (Menú de Inicio)</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Lo Vivido Esta Semana (Portada)
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Momentos destacados que rotan automáticamente cada 4 segundos en el carrusel Bento de la pantalla de inicio con fotos o videos cortos de 7 segundos.
                </p>
              </div>

              {canManageEvents && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ ...emptyForm(), isLoVivido: true });
                    setIsEditorOpen(true);
                  }}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#00dfa2] hover:bg-emerald-400 text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus size={18} />
                  <span>Agregar Momento a Portada</span>
                </button>
              )}
            </div>

            {loVividoItems.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-emerald-500/20 bg-[#071612]/70 text-slate-400 space-y-2">
                <Sparkles size={32} className="mx-auto text-emerald-400/60" />
                <p className="text-base font-bold text-white">No hay momentos marcados para la portada actualmente.</p>
                <p className="text-xs text-slate-400">Puedes destacar cualquier evento o crear un momento nuevo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {loVividoItems.map((item) => {
                  const isVideo = item.mediaType === 'video' || Boolean(item.video);
                  return (
                    <article
                      key={item.id}
                      className="relative group overflow-hidden rounded-3xl bg-slate-950 border border-emerald-500/35 hover:border-[#00dfa2] shadow-2xl transition-all duration-500 flex flex-col justify-end p-5 min-h-[420px] sm:min-h-[450px] select-none w-full"
                    >
                      {/* Fondo Multimedia Completo (Video 7s o Fotografía) */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {isVideo && item.video ? (
                          <video
                            src={item.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover brightness-[0.88] contrast-105"
                          />
                        ) : (
                          <img
                            src={item.image || '/cmv-fellowship.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover brightness-[0.88] contrast-105 group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Header de la tarjeta */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00dfa2] text-black text-xs font-black uppercase tracking-wider shadow-lg">
                          <Star size={12} className="fill-black text-black" />
                          <span>EN PORTADA (INICIO)</span>
                        </span>

                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-1">
                          {isVideo ? <Film size={12} className="text-[#00dfa2]" /> : <Camera size={12} className="text-amber-300" />}
                          <span>{isVideo ? 'Video 7s' : 'Foto'}</span>
                        </span>
                      </div>

                      {/* Contenido con tipografía ampliada */}
                      <div className="relative z-10 space-y-2 mt-auto">
                        <span className="text-xs font-black uppercase tracking-wider text-[#00dfa2] drop-shadow-sm block">
                          {item.badge || 'MOMENTO DESTACADO'}
                        </span>
                        
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md break-words">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm font-semibold text-[#00dfa2] drop-shadow-sm leading-snug line-clamp-3">
                          {item.text}
                        </p>
                        
                        <p className="text-xs text-gray-300 font-bold pt-1">
                          {formatDateLabel(item.date)}
                        </p>

                        {/* Botones de gestión para líderes (tamaño balanceado) */}
                        {canManageEvents && (
                          <div className="pt-3 mt-2 border-t border-white/15 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleLoVivido(item)}
                              className="flex-1 py-2 px-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-black uppercase tracking-wider hover:bg-amber-400/20 transition-colors cursor-pointer"
                              title="Quitar este elemento del carrusel de inicio"
                            >
                              Quitar Portada
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="py-2 px-3 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-black uppercase tracking-wider hover:bg-white/20 transition-colors cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePublication(item)}
                              className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECCIÓN 2: EVENTOS PASADOS & APORTES DE LA COMUNIDAD */}
          <section className="space-y-4 pt-8 border-t border-white/10 w-full max-w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#c5a059]">
                  Participación de Líderes y Comunidad
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Eventos Pasados & Lo Vivido
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Fotos, videos cortos y testimonios compartidos por la comunidad de reuniones y eventos concluidos.
                </p>
              </div>
            </div>

            {completedEvents.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-white/15 bg-[#071612]/60 text-slate-400 space-y-2">
                <Camera size={32} className="mx-auto text-slate-500" />
                <p className="text-base font-bold text-white">
                  Aún no hay eventos marcados como concluidos.
                </p>
                <p className="text-xs text-slate-400">
                  En la pestaña de "Próximos Eventos" haz clic en "Concluir Evento" para habilitar la carga de fotos del encuentro.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {completedEvents.map((item) => {
                  const mediaCount = (item.mediaItems || []).length;
                  const firstThreeMedia = (item.mediaItems || []).slice(0, 3);

                  return (
                    <article
                      key={item.id}
                      className="rounded-3xl bg-[#071612]/90 border border-emerald-500/30 p-5 shadow-2xl flex flex-col justify-between space-y-4 hover:border-emerald-400/60 transition-all w-full"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-[#00dfa2] border border-emerald-500/30">
                            Evento Concluido
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {formatDateLabel(item.date)}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-[#c5a059]">
                            {item.badge}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight mt-0.5 break-words">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {item.text}
                          </p>
                        </div>

                        {/* Galería de miniaturas subidas por la comunidad */}
                        {mediaCount > 0 ? (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                              <span className="flex items-center gap-1.5 text-[#00dfa2]">
                                <Camera size={14} />
                                {mediaCount} {mediaCount === 1 ? 'aporte comunitario' : 'aportes comunitarios'}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 h-20">
                              {firstThreeMedia.map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => setGalleryModalEvent(item)}
                                  className="relative rounded-xl overflow-hidden bg-black border border-white/10 cursor-pointer group"
                                >
                                  {m.mediaType === 'video' ? (
                                    <video src={m.url} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  )}
                                  {m.isHighlight && (
                                    <span className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-400 text-black">
                                      <Star size={10} className="fill-black" />
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-slate-400">
                            Aún no se han subido fotos comunitarias de este evento.
                          </div>
                        )}
                      </div>

                      {/* Botones de acción comunitaria con tipografía ampliada */}
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUploadModalEvent(item)}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00dfa2] hover:brightness-110 text-black text-sm sm:text-base font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Camera size={18} />
                            <span>Cargar Foto o Video de lo Sucedido</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGalleryModalEvent(item)}
                            className="py-3 px-3.5 rounded-xl border border-white/15 bg-white/5 text-slate-200 text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                            title="Ver galería completa"
                          >
                            Galería ({mediaCount})
                          </button>
                        </div>

                        {canManageEvents && (
                          <div className="flex items-center justify-between gap-2 pt-1 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => handleToggleEventStatus(item)}
                              className="text-slate-400 hover:text-cyan-400 uppercase tracking-wider cursor-pointer"
                            >
                              ↩ Reactivar Próximo
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="text-[#c5a059] hover:underline uppercase tracking-wider cursor-pointer"
                            >
                              Editar Evento
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* =========================================================================
          VISTA 2: PRÓXIMOS EVENTOS (AGENDA CON ESTÉTICA BENTO Y TIPOGRAFÍA AMPLIADA)
         ========================================================================= */}
      {currentTab === 'proximos' && (
        <div className="space-y-6 w-full max-w-full min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#00dfa2]">
                Agenda Semanal de Eventos
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Próximos Eventos Programados
              </h2>
            </div>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-white/10 bg-[#071612]/70 text-slate-400 space-y-2">
              <Calendar size={36} className="mx-auto text-cyan-400/60" />
              <p className="text-base font-bold text-white">No hay eventos programados en este momento.</p>
              <p className="text-sm text-slate-400">Haz clic en "Crear Evento / Noticia" para agendar una nueva fecha.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {upcomingEvents.map((item) => {
                const hasVideo = Boolean(item.video || item.mediaType === 'video');
                return (
                  <article
                    key={item.id}
                    className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#071612]/95 via-[#091b15]/90 to-[#05100d]/95 border border-cyan-500/25 hover:border-cyan-400/60 p-4 sm:p-6 shadow-2xl transition-all duration-300 flex flex-col justify-between w-full"
                  >
                    <div className="space-y-4">
                      {/* Fila superior con fecha y categoría */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          {formatDateLabel(item.date)} {item.time ? `· ${item.time} hs` : ''}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-[#c5a059]">
                          {item.badge || 'AGENDA'}
                        </span>
                      </div>

                      {/* Preview multimedia */}
                      {hasVideo && item.video ? (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black shadow-md">
                          <video
                            src={item.video}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-black uppercase tracking-wider text-[#00dfa2] flex items-center gap-1 pointer-events-none">
                            <Film size={12} /> Video Corto 7s
                          </span>
                        </div>
                      ) : item.image ? (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44 bg-black">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1 pointer-events-none">
                            <Camera size={12} /> Fotografía
                          </span>
                        </div>
                      ) : null}

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors break-words">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed mt-1.5">
                          {item.text}
                        </p>
                      </div>

                      <div className="pt-2 text-xs text-slate-300 flex items-center justify-between border-t border-white/5">
                        <span>Células: {item.involved.cells.join(', ') || 'General'}</span>
                        <span>{item.author ? `Por: ${item.author}` : ''}</span>
                      </div>
                    </div>

                    {/* Barra de acciones para líderes: Concluir evento, Cargar foto/video y Editar */}
                    <div className="pt-4 mt-3 border-t border-white/10 space-y-2.5">
                      {/* BOTÓN 1: Concluir Evento (Abre modal emergente con fecha próxima y carga de material) */}
                      {canManageEvents && (
                        <button
                          type="button"
                          onClick={() => handleConcludeAndUpload(item)}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00dfa2] hover:brightness-110 text-black text-sm sm:text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                          <Check size={20} />
                          <span>Concluir Evento</span>
                        </button>
                      )}

                      {/* BOTÓN 2: Cargar foto o video de lo sucedido (Abre ventana emergente) */}
                      <button
                        type="button"
                        onClick={() => setUploadModalEvent(item)}
                        className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm sm:text-base font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Camera size={18} className="text-[#00dfa2]" />
                        <span>Cargar Foto o Video de lo Sucedido</span>
                      </button>

                      {/* Botones secundarios de líderes (tamaño balanceado) */}
                      {canManageEvents && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="flex-1 py-2 px-3 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] text-xs font-bold uppercase tracking-wider hover:bg-[#c5a059]/20 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePublication(item)}
                            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Eliminar publicación"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VISTA 3: NOTICIAS & TODAS LAS PUBLICACIONES (TARJETAS BENTO)
         ========================================================================= */}
      {(currentTab === 'todos' || currentTab === 'noticias') && (
        <div className="w-full max-w-full min-w-0">
          {filteredFeed.length === 0 ? (
            <div className="bg-[#071612]/70 rounded-3xl border border-white/10 p-10 text-center text-slate-400">
              No hay publicaciones disponibles para los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredFeed.map((item) => {
                const isEvent = item.kind === 'evento';
                const hasVideo = Boolean(item.video || item.mediaType === 'video');
                const mediaCount = (item.mediaItems || []).length;

                return (
                  <article
                    key={item.id}
                    className="relative group overflow-hidden bg-[#071612]/90 rounded-3xl border border-emerald-500/20 hover:border-[#c5a059]/50 p-4 sm:p-6 shadow-2xl transition-all duration-300 flex flex-col justify-between w-full"
                  >
                    <div className="space-y-4">
                      {/* Fila superior con Kind, Portada y Visibilidad */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            isEvent ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isEvent ? 'Evento' : 'Noticia'}
                          </span>
                          {item.isLoVivido && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-[#00dfa2] border border-emerald-500/30">
                              ⭐ Portada
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider font-black border ${
                            item.visibility === 'publico'
                              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                              : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          {item.visibility}
                        </span>
                      </div>

                      {/* Multimedia */}
                      {hasVideo && item.video ? (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black shadow-md">
                          <video
                            src={item.video}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-black uppercase tracking-wider text-[#00dfa2] flex items-center gap-1 pointer-events-none">
                            <Film size={12} /> Video Corto 7s
                          </span>
                        </div>
                      ) : item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-44 object-cover rounded-2xl border border-white/10"
                        />
                      ) : null}

                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#c5a059]">
                          <Tag size={12} className="inline mr-1" />
                          {item.badge || 'CMV'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#c5a059] transition-colors break-words mt-1">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed mt-1.5">
                          {item.text}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 space-y-1 text-xs text-slate-300">
                        <p className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#c5a059]" />
                          <span>{formatDateLabel(item.date)} {item.time ? `· ${item.time} hs` : ''}</span>
                        </p>
                        <p>
                          Autor:{' '}
                          <BrotherNameTrigger
                            name={item.author}
                            className="text-slate-200 hover:text-[#c5a059] transition-colors font-semibold"
                            fallbackClassName="text-slate-200"
                          />
                        </p>
                      </div>
                    </div>

                    {/* Acciones de la tarjeta */}
                    <div className="pt-4 mt-3 border-t border-white/10 space-y-2">
                      {isEvent && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setUploadModalEvent(item)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-[#00dfa2] border border-emerald-500/30 text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Camera size={15} />
                            <span>Cargar Foto/Video de lo Sucedido</span>
                          </button>
                          {mediaCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setGalleryModalEvent(item)}
                              className="py-2.5 px-3 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                            >
                              Galería ({mediaCount})
                            </button>
                          )}
                        </div>
                      )}

                      {canManageEvents && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="flex-1 py-2.5 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] text-xs uppercase tracking-widest font-black hover:bg-[#c5a059]/20 transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePublication(item)}
                            className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Eliminar publicación"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL DE CONFIGURACIÓN & APARIENCIA (TEMA CLARO / OSCURO)
         ========================================================================= */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Configuración & Apariencia"
      >
        <div className="space-y-6 text-white p-1">
          {/* Control de Tema Claro / Oscuro */}
          <div className="p-5 rounded-2xl bg-[#071612]/95 border border-emerald-500/35 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-[#00dfa2] shrink-0">
                {isDark ? <Moon size={24} /> : <Sun size={24} className="text-amber-400" />}
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  Tema de la Plataforma
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-snug">
                  Selecciona tu modo de lectura preferido (Claro u Oscuro).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (isDark) toggleTheme();
                }}
                className={`py-3.5 px-4 rounded-xl border text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-amber-400 text-black border-amber-400 shadow-lg font-black ring-2 ring-amber-300'
                    : 'bg-white/5 border-white/15 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Sun size={20} />
                <span>☀️ Modo Claro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDark) toggleTheme();
                }}
                className={`py-3.5 px-4 rounded-xl border text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-600 to-[#00dfa2] text-black border-emerald-400 shadow-lg font-black ring-2 ring-[#00dfa2]/60'
                    : 'bg-white/5 border-white/15 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Moon size={20} />
                <span>🌙 Modo Oscuro</span>
              </button>
            </div>
          </div>

          {/* Información y Tiempos de Rotación */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs sm:text-sm text-slate-300">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#00dfa2]" />
              Carrusel dinámico "Lo Vivido Esta Semana":
            </p>
            <p className="leading-relaxed">
              Los videos cortos de 7 segundos y fotos destacadas rotan automáticamente en la pantalla de inicio cada 4 segundos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4b375] text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg cursor-pointer"
          >
            Listo
          </button>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL DE CONFIGURACIÓN Y EDICIÓN (OBSIDIAN CON CONTROL DE TEMA INCLUIDO)
         ========================================================================= */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingId ? 'Editar Evento / Publicación' : 'Crear Nuevo Evento o Noticia'}
      >
        <div className="space-y-6 text-white p-1">
          {/* Selector de Modo Claro / Modo Oscuro dentro de la configuración */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isDark ? <Moon size={18} className="text-[#00dfa2]" /> : <Sun size={18} className="text-amber-400" />}
              <div>
                <span className="text-xs sm:text-sm font-black text-white block">
                  Apariencia: {isDark ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Ajusta el tema visual desde la configuración
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-900 text-white border border-white/20'
              }`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDark ? '☀️ Claro' : '🌙 Oscuro'}</span>
            </button>
          </div>

          {/* 1. Selector de Tipo: Evento vs Noticia */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, kind: 'evento' }))}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                form.kind === 'evento'
                  ? 'bg-gradient-to-br from-cyan-950/80 to-[#071612] border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={18} className={form.kind === 'evento' ? 'text-cyan-400' : 'text-slate-400'} />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Evento en Agenda</span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">
                Programación con fecha, hora y registro comunitario de lo vivido.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, kind: 'noticia' }))}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                form.kind === 'noticia'
                  ? 'bg-gradient-to-br from-amber-950/80 to-[#071612] border-[#c5a059] text-white shadow-lg shadow-[#c5a059]/20 ring-1 ring-[#c5a059]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Newspaper size={18} className={form.kind === 'noticia' ? 'text-[#c5a059]' : 'text-slate-400'} />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Noticia / Comunicado</span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">
                Anuncios generales o testimonios para la comunidad.
              </p>
            </button>
          </div>

          {/* 2. Selector de Visibilidad */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, visibility: 'publico' }))}
              className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                form.visibility === 'publico'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span>🌐 Público (Toda la Iglesia)</span>
            </button>

            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, visibility: 'privado' }))}
              className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                form.visibility === 'privado'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span>🔒 Privado (Células Específicas)</span>
            </button>
          </div>

          {/* 3. HERO SWITCH: Destacar en Lo Vivido Esta Semana (Carrusel Bento de Inicio) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#071612] to-black border border-emerald-500/40 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#00dfa2] flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  Destacar en "Lo Vivido Esta Semana" (Carrusel de Portada)
                </span>
                <p className="text-xs text-emerald-300/80 leading-snug mt-0.5">
                  Rotará inmediatamente en el Bento principal de la pantalla de inicio con su foto o video 7s.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={form.isLoVivido}
                onChange={(e) => setForm((prev) => ({ ...prev, isLoVivido: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00dfa2] ring-1 ring-white/20"></div>
            </label>
          </div>

          {/* 4. Selector de Estado del Evento (si es evento) */}
          {form.kind === 'evento' && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
                Estado del Evento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: 'proximo' }))}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    form.status === 'proximo'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md font-black'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Próximo (En Agenda)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: 'concluido' }))}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    form.status === 'concluido'
                      ? 'bg-gradient-to-r from-emerald-600 to-[#00dfa2] text-black border-emerald-400 shadow-md font-black'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ Concluido (Lo Vivido)
                </button>
              </div>
            </div>
          )}

          {/* 5. Campos de Texto Principales con Tipografía Ampliada */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                Título del Evento o Noticia *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="ej. Campamento Anual 2026, Noche de Avivamiento"
                className="w-full p-3.5 rounded-xl border border-emerald-500/30 bg-black/60 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2] focus:ring-1 focus:ring-[#00dfa2]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                  Fecha {form.kind === 'evento' ? '*' : '(opcional)'}
                </label>
                <input
                  type={form.kind === 'evento' ? 'date' : 'text'}
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  placeholder="AAAA-MM-DD"
                  className="w-full p-3 rounded-xl border border-white/15 bg-black/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2]"
                  required={form.kind === 'evento'}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                  Hora (opcional)
                </label>
                <input
                  type="text"
                  value={form.time ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                  placeholder="ej. 19:30 o 20:00 hs"
                  className="w-full p-3 rounded-xl border border-white/15 bg-black/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                Badge / Etiqueta destacada
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                placeholder="ej. Jóvenes CMV, Alabanza, Zaeta, General"
                className="w-full p-3 rounded-xl border border-white/15 bg-black/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                Descripción o Detalle *
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={3}
                placeholder="Escribe los detalles del evento, lugar, propósito y exhortación..."
                className="w-full p-3.5 rounded-xl border border-white/15 bg-black/60 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2] resize-none"
                required
              />
            </div>
          </div>

          {/* 6. Formato Multimedia: Video Corto 7s vs Fotografía */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                {form.mediaType === 'video' ? <Film size={16} className="text-[#00dfa2]" /> : <Camera size={16} className="text-[#c5a059]" />}
                Contenido Multimedia (Banner & Portada)
              </span>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, mediaType: 'image' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    form.mediaType === 'image'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera size={13} /> Foto
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, mediaType: 'video' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    form.mediaType === 'video'
                      ? 'bg-[#00dfa2] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film size={13} /> Video 7s
                </button>
              </div>
            </div>

            {form.mediaType === 'video' ? (
              <div className="space-y-2">
                <label className="block w-full p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 text-center cursor-pointer hover:bg-emerald-500/10 transition-colors">
                  <Film size={24} className="mx-auto mb-1.5 text-[#00dfa2]" />
                  <span className="font-bold text-xs sm:text-sm text-white block">
                    Cargar Video Corto (ideal 7 segundos)
                  </span>
                  <span className="text-xs text-emerald-300/80">
                    MP4, WebM o MOV desde tu dispositivo
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-slate-400 shrink-0">O URL del video:</span>
                  <input
                    type="text"
                    value={form.video ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.value }))}
                    placeholder="/cmv-event-short.mp4 o https://..."
                    className="flex-1 p-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white"
                  />
                </div>

                {form.video ? (
                  <div className="space-y-2 pt-2">
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 aspect-video bg-black max-h-56">
                      <video src={form.video} controls playsInline className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, video: '' }))}
                      className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-widest font-black border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      Quitar video
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block w-full p-4 rounded-2xl border-2 border-dashed border-[#c5a059]/40 bg-[#c5a059]/5 text-center cursor-pointer hover:bg-[#c5a059]/10 transition-colors">
                  <Camera size={24} className="mx-auto mb-1.5 text-[#c5a059]" />
                  <span className="font-bold text-xs sm:text-sm text-white block">
                    Seleccionar Fotografía de Alta Calidad
                  </span>
                  <span className="text-xs text-[#c5a059]/80">
                    JPG, PNG o WebP desde tu dispositivo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-slate-400 shrink-0">O URL de la foto:</span>
                  <input
                    type="text"
                    value={form.image ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="/cmv-fellowship.jpg o https://..."
                    className="flex-1 p-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white"
                  />
                </div>

                {form.image ? (
                  <div className="space-y-2 pt-2">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-2xl border border-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-widest font-black border border-white/15 text-slate-400 hover:text-white cursor-pointer"
                    >
                      Quitar imagen
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* 7. Involucrados (si es Privado) */}
          {form.visibility === 'privado' && form.kind === 'evento' && (
            <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-amber-500/25">
              <p className="text-xs uppercase tracking-widest font-black text-[#c5a059]">
                Células Involucradas (Acceso Exclusivo)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allCells.map((cell) => (
                  <label key={cell} className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.involvedCells.includes(cell)}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          involvedCells: toggleSelection(prev.involvedCells, cell),
                        }))
                      }
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>{cell}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botón Guardar */}
          <button
            type="button"
            onClick={savePublication}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4b375] hover:brightness-110 text-black font-black uppercase text-sm tracking-widest shadow-xl shadow-[#c5a059]/25 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <Check size={20} />
            <span>{editingId ? 'Guardar Cambios' : 'Publicar Evento'}</span>
          </button>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL LOG DE AUDITORÍA
         ========================================================================= */}
      <Modal isOpen={isChangeLogOpen} onClose={() => setIsChangeLogOpen(false)} title="Log de Auditoría y Cambios">
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-white">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No hay cambios registrados aún.</p>
          ) : (
            logs.map((entry) => (
              <article
                key={entry.id}
                className="p-3.5 rounded-2xl border border-white/10 bg-[#071612]/80 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-black text-[#00dfa2]">{entry.change}</p>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDateTimeForLog(entry.createdAt)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">{entry.details || 'Sin detalle'}</p>
                <p className="text-xs text-slate-400">
                  Responsable: <strong className="text-white">{entry.responsible}</strong>
                </p>
              </article>
            ))
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODALES DE CONCLUIR EVENTO, SUBIDA Y GALERÍA COMUNITARIA
         ========================================================================= */}
      {/* Modal para Concluir Evento, Programar Próxima Fecha y Registrar Lo Vivido */}
      <ConcludeEventModal
        isOpen={Boolean(concludeModalEvent)}
        onClose={() => setConcludeModalEvent(null)}
        event={concludeModalEvent}
        user={user}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          setRefreshKey((prev) => prev + 1);
        }}
      />

      {/* Modal para subida de fotos / testimonios comunitarios */}
      <UploadEventMediaModal
        isOpen={Boolean(uploadModalEvent)}
        onClose={() => setUploadModalEvent(null)}
        event={uploadModalEvent}
        user={user}
        canManageEvents={canManageEvents}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          setRefreshKey((prev) => prev + 1);
        }}
      />

      {/* Modal para ver galería y moderar fotos del evento */}
      <EventMediaGalleryModal
        isOpen={Boolean(galleryModalEvent)}
        onClose={() => setGalleryModalEvent(null)}
        event={galleryModalEvent}
        user={user}
        canManageEvents={canManageEvents}
        onOpenUpload={() => {
          if (galleryModalEvent) {
            setUploadModalEvent(galleryModalEvent);
          }
        }}
        onUpdate={() => setRefreshKey((prev) => prev + 1)}
      />

      <Toast
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};
