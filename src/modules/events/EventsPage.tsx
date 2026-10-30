import { Calendar, ChevronDown, Filter, History, Newspaper, Plus, Tag, Users, Video, Camera, Trash2, Film, Clock } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { brothersService } from '../../services/brothersService';
import { eventsChangeLogService } from '../../services/eventsChangeLogService';
import { eventsService, PublicationDraft, PublicationItem } from '../../services/eventsService';
import { Cell, Role } from '../../types';

type ToastType = 'success' | 'error';
type ContentFilter = 'eventos' | 'noticias';
type VisibilityFilter = 'publico' | 'privado';

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

  const canManageEvents = useMemo(() => eventsService.canManageForUser(user), [user]);

  const publications = useMemo(
    () => eventsService.listPublicationsVisibleForUser(user),
    [user, refreshKey],
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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 dark:text-gray-500">
              Comunicacion y Agenda
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-500">
              Eventos / Noticias
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-300 mt-2">
              Carga unificada de publicaciones internas, eventos y videos cortos para la agenda congregacional.
            </p>
          </div>

          {canManageEvents ? (
            <div className="hidden md:flex w-full sm:w-auto flex-wrap items-center gap-3">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-[#c5a059] hover:bg-[#d4b375] text-black font-black rounded-2xl transition-all shadow-[0_10px_20px_rgba(197,160,89,0.2)] active:scale-95"
              >
                <Plus size={18} />
                <span>Crear nuevo</span>
              </button>
              <button
                onClick={() => setIsChangeLogOpen(true)}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all active:scale-95"
              >
                <History size={18} />
                <span>Log de cambios</span>
              </button>
            </div>
          ) : (
            <span className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-black border border-blue-400/30 bg-blue-500/10 text-blue-300">
              Solo lectura
            </span>
          )}
        </div>

        <section className="md:hidden space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {canManageEvents ? (
              <button
                onClick={openCreateModal}
                className="rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-widest font-black transition-all bg-[#c5a059] text-black"
              >
                Crear nuevo
              </button>
            ) : (
              <span className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] font-black border border-blue-400/30 bg-blue-500/10 text-blue-300">
                Solo lectura
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(true)}
              className="rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-widest font-black transition-all bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10"
            >
              Resumen
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-gray-300">
              Filtros activos: {activeFilterCount}/4
            </p>
            <button
              type="button"
              onClick={() => setIsMobileFiltersModalOpen(true)}
              className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-gray-300 flex items-center justify-center"
              aria-label="Abrir filtros"
            >
              <Filter size={16} />
            </button>
          </div>
        </section>

        <div className="hidden md:flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            onClick={enableAllFilters}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
              isAllFiltersSelected
                ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => toggleContentFilter('eventos')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
              contentFilters.includes('eventos')
                ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Solo Eventos
          </button>
          <button
            onClick={() => toggleContentFilter('noticias')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
              contentFilters.includes('noticias')
                ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Solo Noticias
          </button>
          <button
            onClick={() => toggleVisibilityFilter('publico')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
              visibilityFilters.includes('publico')
                ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Publicos
          </button>
          <button
            onClick={() => toggleVisibilityFilter('privado')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${
              visibilityFilters.includes('privado')
                ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Privados
          </button>
        </div>
      </header>

      {filteredFeed.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 text-center text-slate-500 dark:text-gray-400">
          No hay contenido para este filtro.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredFeed.map((item) => {
              const isEvent = item.kind === 'evento';
              const isExpanded = expandedPublicationId === item.id;
              const hasVideo = Boolean(item.video || item.mediaType === 'video');

              return (
                <article
                  key={item.id}
                  className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-white/10 p-4 shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedPublicationId(isExpanded ? null : item.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#c5a059] shrink-0">
                        {isEvent ? <Calendar size={20} /> : <Newspaper size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight break-words">{item.title}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-gray-300 uppercase tracking-widest font-black mt-1">
                          {isEvent ? 'Evento' : 'Noticia'} · {formatDateLabel(item.date)} {item.time ? `· ${item.time} hs` : ''}
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 mt-1 text-slate-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-[#c5a059]' : ''}`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                    }`}
                  >
                    <div className="overflow-hidden border-t border-slate-200 dark:border-white/10 pt-3 space-y-3">
                      {hasVideo && item.video ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video bg-black">
                          <video
                            src={item.video}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 pointer-events-none">
                            <Film size={10} /> Video 7s
                          </span>
                        </div>
                      ) : item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-36 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
                        />
                      ) : null}

                      <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed break-words">{item.text}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-300">
                        <Tag size={12} className="inline mr-1" />
                        {item.badge}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-300">
                        Autor:{' '}
                        <BrotherNameTrigger
                          name={item.author}
                          className="text-xs text-slate-600 dark:text-gray-200"
                          fallbackClassName="text-xs text-slate-600 dark:text-gray-200"
                        />
                      </p>

                      {item.visibility === 'privado' && isEvent ? (
                        <p className="text-xs text-slate-500 dark:text-gray-300">
                          Celulas: {item.involved.cells.join(', ') || 'Sin seleccion'}
                        </p>
                      ) : null}

                      {canManageEvents ? (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="flex-1 py-2.5 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] text-[11px] uppercase tracking-widest font-black hover:bg-[#c5a059]/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePublication(item)}
                            className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeed.map((item) => {
              const isEvent = item.kind === 'evento';
              const hasVideo = Boolean(item.video || item.mediaType === 'video');

              return (
                <article
                  key={item.id}
                  className="group relative bg-white dark:bg-[#141414] rounded-3xl border border-slate-200 dark:border-white/10 p-6 hover:border-[#c5a059]/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">
                      {isEvent ? 'Evento' : 'Noticia'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                        item.visibility === 'publico'
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {item.visibility}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                      {isEvent ? <Calendar size={24} /> : <Newspaper size={24} />}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#c5a059] transition-colors break-words">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-300 uppercase tracking-widest font-black">
                        <Tag size={12} className="inline mr-1" />
                        {item.badge}
                      </p>
                    </div>

                    {hasVideo && item.video ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video bg-black shadow-md">
                        <video
                          src={item.video}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 pointer-events-none">
                          <Film size={11} /> Video Corto 7s
                        </span>
                      </div>
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
                      />
                    ) : null}

                    <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed break-words">{item.text}</p>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-1.5">
                      <p className="text-xs text-slate-500 dark:text-gray-300 flex items-center gap-1.5">
                        <Clock size={13} className="text-[#c5a059]" />
                        <span>
                          Fecha: {formatDateLabel(item.date)} {item.time ? `· ${item.time} hs` : ''}
                        </span>
                      </p>
                      <div className="text-xs text-slate-500 dark:text-gray-300">
                        Autor:{' '}
                        <BrotherNameTrigger
                          name={item.author}
                          className="text-xs text-slate-500 dark:text-gray-300 hover:text-[#c5a059] transition-colors"
                          fallbackClassName="text-xs text-slate-500 dark:text-gray-300"
                        />
                      </div>
                    </div>

                    {item.visibility === 'privado' && isEvent ? (
                      <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] flex items-center gap-1">
                          <Users size={12} />
                          Involucrados
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-300">
                          Celulas: {item.involved.cells.join(', ') || 'Sin seleccion'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-300">
                          Pastores: {item.involved.pastors.join(', ') || 'Sin seleccion'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-300">
                          Discipulos: {item.involved.disciples.join(', ') || 'Sin seleccion'}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {canManageEvents ? (
                    <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-200 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="flex-1 py-3 rounded-2xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] text-[11px] uppercase tracking-widest font-black hover:bg-[#c5a059]/20 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePublication(item)}
                        className="px-4 py-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Eliminar publicación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}

      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Resumen">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Publicaciones</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{publications.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Filtradas</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{filteredFeed.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Eventos</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{eventsCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Noticias</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{newsCount}</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isMobileFiltersModalOpen} onClose={() => setIsMobileFiltersModalOpen(false)} title="Filtros">
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-gray-300">Ajusta contenido y visibilidad del feed.</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={enableAllFilters}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                isAllFiltersSelected
                  ? 'bg-[#c5a059] text-black border-[#c5a059]'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => toggleContentFilter('eventos')}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                contentFilters.includes('eventos')
                  ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
            >
              Eventos
            </button>
            <button
              type="button"
              onClick={() => toggleContentFilter('noticias')}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                contentFilters.includes('noticias')
                  ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
            >
              Noticias
            </button>
            <button
              type="button"
              onClick={() => toggleVisibilityFilter('publico')}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                visibilityFilters.includes('publico')
                  ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
            >
              Publicos
            </button>
            <button
              type="button"
              onClick={() => toggleVisibilityFilter('privado')}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                visibilityFilters.includes('privado')
                  ? 'bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
            >
              Privados
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileFiltersModalOpen(false)}
            className="w-full py-3 rounded-xl bg-[#c5a059] text-black text-[11px] uppercase tracking-widest font-black"
          >
            Aplicar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingId ? 'Editar publicacion' : 'Crear nuevo'}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, kind: 'evento' }))}
              className={`w-full px-4 py-3 rounded-2xl border text-xs uppercase tracking-widest font-black transition-all ${
                form.kind === 'evento'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Evento
            </button>
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, kind: 'noticia' }))}
              className={`w-full px-4 py-3 rounded-2xl border text-xs uppercase tracking-widest font-black transition-all ${
                form.kind === 'noticia'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Noticia
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, visibility: 'publico' }))}
              className={`w-full px-4 py-3 rounded-2xl border text-xs uppercase tracking-widest font-black transition-all ${
                form.visibility === 'publico'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Publico
            </button>
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, visibility: 'privado' }))}
              className={`w-full px-4 py-3 rounded-2xl border text-xs uppercase tracking-widest font-black transition-all ${
                form.visibility === 'privado'
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Privado
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
              placeholder="Titulo del evento o noticia"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f] text-sm text-slate-900 dark:text-white"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-gray-400 mb-1">
                  Fecha
                </label>
                <input
                  type={form.kind === 'evento' ? 'date' : 'text'}
                  value={form.date}
                  onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
                  placeholder={form.kind === 'evento' ? undefined : 'Fecha referencial (opcional)'}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f] text-sm text-slate-900 dark:text-white"
                  required={form.kind === 'evento'}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-gray-400 mb-1">
                  Hora (opcional)
                </label>
                <input
                  type="text"
                  value={form.time ?? ''}
                  onChange={(event) => setForm((previous) => ({ ...previous, time: event.target.value }))}
                  placeholder="ej. 19:30 o 20:00 hs"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f] text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <textarea
            value={form.text}
            onChange={(event) => setForm((previous) => ({ ...previous, text: event.target.value }))}
            placeholder="Descripción o detalle del evento..."
            className="w-full min-h-[110px] p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f] text-sm text-slate-900 dark:text-white resize-none"
          />

          <div className="space-y-3 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                {form.mediaType === 'video' ? <Film size={14} className="text-emerald-400" /> : <Camera size={14} className="text-[#c5a059]" />}
                Formato Multimedia (Próximos Eventos)
              </span>
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm((previous) => ({ ...previous, mediaType: 'image' }))}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    form.mediaType === 'image'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera size={12} /> Foto
                </button>
                <button
                  type="button"
                  onClick={() => setForm((previous) => ({ ...previous, mediaType: 'video' }))}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    form.mediaType === 'video'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Film size={12} /> Video 7s
                </button>
              </div>
            </div>

            {form.mediaType === 'video' ? (
              <div className="space-y-2">
                <label className="block w-full p-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-xs text-slate-700 dark:text-gray-300 cursor-pointer text-center hover:bg-emerald-500/10 transition-colors">
                  <span className="font-bold text-emerald-500 dark:text-emerald-400 block mb-1">
                    Cargar Video Corto (ideal 7 segundos)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400">
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">O ingresa URL:</span>
                  <input
                    type="text"
                    value={form.video ?? ''}
                    onChange={(event) => setForm((previous) => ({ ...previous, video: event.target.value }))}
                    placeholder="/cmv-event-short.mp4 o https://..."
                    className="flex-1 p-2 text-xs rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f]"
                  />
                </div>

                {form.video ? (
                  <div className="space-y-2 pt-2">
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 aspect-video bg-black max-h-56">
                      <video
                        src={form.video}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((previous) => ({ ...previous, video: '' }))}
                      className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                    >
                      Quitar video
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-white dark:bg-[#0f0f0f] text-xs text-slate-700 dark:text-gray-300 cursor-pointer text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="font-bold text-[#c5a059] block mb-1">
                    Seleccionar imagen desde dispositivo
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400">
                    JPG, PNG o WebP en buena resolución
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">O ingresa URL:</span>
                  <input
                    type="text"
                    value={form.image ?? ''}
                    onChange={(event) => setForm((previous) => ({ ...previous, image: event.target.value }))}
                    placeholder="/cmv-fellowship.jpg o https://..."
                    className="flex-1 p-2 text-xs rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f]"
                  />
                </div>

                {form.image ? (
                  <div className="space-y-2 pt-2">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((previous) => ({ ...previous, image: '' }))}
                      className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Quitar imagen
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            <div className="pt-2">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-gray-400 mb-1">
                Badge / Etiqueta destacada
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(event) => setForm((previous) => ({ ...previous, badge: event.target.value }))}
                placeholder="ej. Campamento 2026, Jóvenes CMV, Alabanza"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {form.visibility === 'privado' && form.kind === 'evento' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-2">Celulas involucradas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {allCells.map((cell) => (
                    <label
                      key={cell}
                      className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.involvedCells.includes(cell)}
                        onChange={() =>
                          setForm((previous) => ({
                            ...previous,
                            involvedCells: toggleSelection(previous.involvedCells, cell),
                          }))
                        }
                      />
                      {cell}
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-2">Pastores involucrados</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pastorOptions.map((name) => (
                    <label
                      key={name}
                      className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.involvedPastors.includes(name)}
                        onChange={() =>
                          setForm((previous) => ({
                            ...previous,
                            involvedPastors: toggleSelection(previous.involvedPastors, name),
                          }))
                        }
                      />
                      {name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-2">Discipulos involucrados</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {discipuloOptions.map((name) => (
                    <label
                      key={name}
                      className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.involvedDisciples.includes(name)}
                        onChange={() =>
                          setForm((previous) => ({
                            ...previous,
                            involvedDisciples: toggleSelection(previous.involvedDisciples, name),
                          }))
                        }
                      />
                      {name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={savePublication}
            className="w-full py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black uppercase text-xs tracking-widest shadow-md transition-all active:scale-[0.99]"
          >
            {editingId ? 'Guardar cambios' : 'Crear publicacion'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isChangeLogOpen} onClose={() => setIsChangeLogOpen(false)} title="Log de cambios">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No hay cambios registrados aun.</p>
          ) : (
            logs.map((entry) => (
              <article
                key={entry.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
              >
                <p className="text-xs font-black text-slate-900 dark:text-white">{entry.change}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{entry.details || 'Sin detalle'}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">
                  {formatDateTimeForLog(entry.createdAt)} - Responsable: {entry.responsible}
                </p>
              </article>
            ))
          )}
        </div>
      </Modal>

      <Toast
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};
