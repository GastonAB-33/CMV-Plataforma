import React, { useMemo, useState } from 'react';
import { Search, ChevronRight, UserPlus, Filter, Sparkles, ChevronDown, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brothersService } from '../../services/brothersService';
import { useAuth } from '../../hooks/useAuth';
import { Proceso } from '../../types';
import { STAGE_COLORS } from '../../theme/stages';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';
import { getAvatarForBrother } from '../../services/avatarService';
import { BrotherListItem } from './types';
import { RecursosModal } from './components/RecursosModal';

const STAGES = ['Todas', Proceso.ALTAR, Proceso.GRUPO, Proceso.EXPERIENCIA, Proceso.EDDI, Proceso.DISCIPULO] as const;

type StageFilter = (typeof STAGES)[number];
type InitialStage = 'Altar' | 'Grupo' | 'Experiencia';
type ToastType = 'success' | 'error' | 'info';

const DEFAULT_CELL_OPTIONS = ['Vida', 'Nissi', 'Zaeta', 'Sion', 'Maranata', 'Alpha y Omega'];

const splitFullName = (fullName: string): { nombres: string; apellidos: string } => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) {
    return { nombres: parts[0] ?? '', apellidos: '-' };
  }

  if (parts.length === 2) {
    return { nombres: parts[0], apellidos: parts[1] };
  }

  const nombres = parts.slice(0, parts.length - 1).join(' ');
  const apellidos = parts[parts.length - 1] ?? '-';
  return { nombres, apellidos };
};

export const BrotherList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<StageFilter>('Todas');
  const [expandedBrotherId, setExpandedBrotherId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isStageFilterModalOpen, setIsStageFilterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecursosModalOpen, setIsRecursosModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Alta de hermano procesada correctamente.');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [brothers, setBrothers] = useState<BrotherListItem[]>(() => brothersService.listForListing());
  const [isLoadingBrothers, setIsLoadingBrothers] = useState(true);
  const [cellOptions, setCellOptions] = useState<string[]>(DEFAULT_CELL_OPTIONS);
  const [isSavingBrother, setIsSavingBrother] = useState(false);
  const [newBrotherName, setNewBrotherName] = useState('');
  const [newBrotherBirthDate, setNewBrotherBirthDate] = useState('');
  const [newBrotherDate, setNewBrotherDate] = useState('');
  const [newBrotherCell, setNewBrotherCell] = useState(DEFAULT_CELL_OPTIONS[0]);
  const [newBrotherStage, setNewBrotherStage] = useState<InitialStage>('Altar');

  const handleSaveBrother = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSavingBrother) {
      return;
    }

    const cleanName = newBrotherName.trim();
    if (!cleanName) {
      setToastType('error');
      setToastMessage('Completá el nombre del hermano.');
      setShowToast(true);
      return;
    }

    setIsSavingBrother(true);

    try {
      const actor = {
        id: user.id,
        name: user.name,
      };

      const cellResult = await brothersService.upsertCellAsync(
        {
          nombre: newBrotherCell,
          activa: true,
        },
        actor,
      );

      if (!cellResult.ok || !cellResult.id) {
        setToastType('error');
        setToastMessage(cellResult.error ?? 'No se pudo preparar la célula.');
        setShowToast(true);
        return;
      }

      const { nombres, apellidos } = splitFullName(cleanName);
      const brotherResult = await brothersService.upsertBrotherAsync(
        {
          nombres,
          apellidos,
          celulaId: cellResult.id,
          fechaNacimiento: newBrotherBirthDate || undefined,
          fechaIngreso: newBrotherDate || undefined,
          estado: newBrotherStage,
        },
        actor,
      );

      if (!brotherResult.ok) {
        setToastType('error');
        setToastMessage(brotherResult.error ?? 'No se pudo guardar el hermano en Supabase.');
        setShowToast(true);
        return;
      }

      const loaded = await brothersService.listForListingAsync();
      setBrothers(loaded);
      setIsModalOpen(false);
      setNewBrotherName('');
      setNewBrotherBirthDate('');
      setNewBrotherDate('');
      setNewBrotherStage('Altar');
      setToastType('success');
      setToastMessage('Hermano guardado correctamente en base de datos.');
      setShowToast(true);
    } catch {
      setToastType('error');
      setToastMessage('No se pudo guardar el hermano. Revisá conexión y configuración Supabase.');
      setShowToast(true);
    } finally {
      setIsSavingBrother(false);
    }
  };

  const filteredBrothers = brothers.filter((brother) => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'Todas' || brother.procesoActual === selectedStage;
    return matchesSearch && matchesStage;
  });

  const mobileRows = filteredBrothers.slice(0, visibleCount);
  const hasMoreMobileRows = filteredBrothers.length > visibleCount;
  const summaryByStage = useMemo(
    () => ({
      total: brothers.length,
      altar: brothers.filter((item) => item.procesoActual === Proceso.ALTAR).length,
      grupo: brothers.filter((item) => item.procesoActual === Proceso.GRUPO).length,
      experiencia: brothers.filter((item) => item.procesoActual === Proceso.EXPERIENCIA).length,
      eddi: brothers.filter((item) => item.procesoActual === Proceso.EDDI).length,
      discipulo: brothers.filter((item) => item.procesoActual === Proceso.DISCIPULO).length,
    }),
    [brothers],
  );

  useEffect(() => {
    let isMounted = true;

    const loadBrothers = async () => {
      try {
        const [loaded, loadedCells] = await Promise.all([
          brothersService.listForListingAsync(),
          brothersService.listCellsAsync(),
        ]);
        if (!isMounted) {
          return;
        }
        setBrothers(loaded);
        const nextCells = loadedCells.length > 0 ? loadedCells : DEFAULT_CELL_OPTIONS;
        setCellOptions(nextCells);
        setNewBrotherCell((previous) =>
          nextCells.includes(previous) ? previous : nextCells[0] ?? DEFAULT_CELL_OPTIONS[0],
        );
      } finally {
        if (isMounted) {
          setIsLoadingBrothers(false);
        }
      }
    };

    void loadBrothers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setExpandedBrotherId(null);
    setVisibleCount(6);
  }, [searchTerm, selectedStage]);

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Banner Principal bajado sutilmente y redondeado en cada esquina */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 mt-2 sm:mt-3">
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl bg-[#06122d]">
          {/* Imagen de fondo de personas */}
          <div className="absolute inset-0 -z-0 overflow-hidden">
            <img
              src="/banner-hermanos.jpg"
              alt="Comunidad CMV"
              className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
            />
            {/* Capa de textura fractal glass para una refracción luminosa integrada */}
            <div 
              className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: "url('/fractal-glass-bg.jpg')" }}
            />
            {/* Gradiente vibrante inspirado en la referencia Telemedicine */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06122d]/95 via-[#0284c7]/85 to-[#059669]/80 dark:from-[#050b1a]/95 dark:via-[#0369a1]/85 dark:to-[#047857]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.35)_0%,transparent_60%)]" />
            {/* Desvanecimiento gradual hacia abajo donde comienza el sistema */}
            <div className="absolute inset-0 banner-fade-mask bg-gradient-to-b from-transparent via-transparent to-black/50" />
          </div>

          {/* Contenido con padding optimizado */}
          <header className="relative z-10 w-full px-6 sm:px-10 md:px-12 pt-12 sm:pt-16 md:pt-18 pb-10 sm:pb-12 md:pb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/30 dark:bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="text-amber-300" size={14} />
                <span>PLATAFORMA VISION CMV</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg leading-none">
                Linea de vida
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-emerald-50 dark:text-cyan-100 font-medium drop-shadow-sm leading-relaxed">
                Seguimiento y gestión espiritual de la Comunidad.
              </p>
            </div>
          </header>
        </div>
      </div>

      {/* Contenedor centralizado para los controles inferiores y tabla */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-6 md:space-y-8">
        {/* Controles móviles */}
        <div className="md:hidden space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full justify-center btn-3d-emerald text-white px-3 py-3.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              <UserPlus size={18} />
              <span>NUEVO</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRecursosModalOpen(true)}
              className="w-full justify-center btn-3d-emerald text-white px-3 py-3.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              <BookOpen size={18} />
              <span>RECURSOS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                className="w-full bg-gradient-to-r from-white/95 via-sky-50/40 to-white/95 dark:from-[#0d192c]/95 dark:via-[#091220]/95 dark:to-[#060c17]/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 focus:border-emerald-500/60 rounded-xl py-3.5 pl-11 pr-3 text-base text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsStageFilterModalOpen(true)}
              className="h-12 w-12 shrink-0 rounded-xl btn-3d-pill-inactive text-slate-600 dark:text-gray-300 flex items-center justify-center hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
              aria-label="Abrir filtros"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y selector de etapas escritorio */}
        <div className="hidden md:block space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                className="w-full bg-gradient-to-r from-white/90 via-sky-50/60 to-white/90 dark:from-[#0d192c]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 backdrop-blur-xl border border-white/60 dark:border-white/15 focus:border-emerald-500/60 rounded-xl py-3.5 pl-13 pr-4 text-slate-900 dark:text-white focus:outline-none transition-all shadow-[0_10px_30px_-5px_rgba(2,132,199,0.08)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.5)] text-base lg:text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="justify-center btn-3d-emerald text-white px-6 py-3.5 rounded-xl text-sm md:text-base font-black flex items-center gap-2 uppercase tracking-wider shadow-md shrink-0 active:scale-95 transition-all"
            >
              <UserPlus size={20} />
              <span>NUEVO</span>
            </button>

            <button
              onClick={() => setIsRecursosModalOpen(true)}
              className="justify-center btn-3d-emerald text-white px-6 py-3.5 rounded-xl text-sm md:text-base font-black flex items-center gap-2 uppercase tracking-wider shadow-md shrink-0 active:scale-95 transition-all"
            >
              <BookOpen size={20} />
              <span>RECURSOS</span>
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-6 py-2.5 rounded-xl text-sm md:text-base font-black whitespace-nowrap transition-all uppercase tracking-wider ${
                  selectedStage === stage
                    ? 'btn-3d-pill-active'
                    : 'btn-3d-pill-inactive text-slate-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

      {filteredBrothers.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {mobileRows.map((brother) => {
              const isExpanded = expandedBrotherId === brother.id;

              return (
                <article
                  key={brother.id}
                  className="rounded-xl border border-white/60 dark:border-white/15 bg-gradient-to-br from-white/90 via-sky-50/60 to-emerald-50/40 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 backdrop-blur-xl p-4 shadow-lg hover:border-emerald-500/50 transition-all"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedBrotherId(isExpanded ? null : brother.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setExpandedBrotherId(isExpanded ? null : brother.id);
                      }
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl overflow-hidden border border-white/70 dark:border-white/20 shadow-md shrink-0 bg-slate-200 dark:bg-slate-800 relative">
                        <img
                          src={brother.fotoUrl || getAvatarForBrother(brother.name)}
                          alt={brother.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <BrotherNameTrigger
                          name={brother.name}
                          className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-tight"
                          fallbackClassName="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-tight"
                        />
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-extrabold tracking-wider mt-1 uppercase">Miembro activo</p>
                        <div className="mt-2.5">
                          <span className={`inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-black border shadow-sm ${STAGE_COLORS[brother.procesoActual]}`}>
                            {brother.procesoActual}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={22}
                        className={`shrink-0 mt-1 text-slate-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180 text-emerald-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                    }`}
                  >
                    <div className="overflow-hidden border-t border-slate-200/80 dark:border-white/10 pt-3.5 space-y-2.5">
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        Celula: <span className="font-extrabold text-slate-800 dark:text-gray-100">{brother.cellName}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        Responsable:{' '}
                        <BrotherNameTrigger
                          name={brother.acompananteName || 'No asig.'}
                          className="font-extrabold text-slate-800 dark:text-gray-100"
                          fallbackClassName="font-extrabold text-slate-800 dark:text-gray-100"
                        />
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate(`/hermanos/${brother.id}`)}
                        className="mt-2 inline-flex items-center gap-2 text-sm uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                      >
                        Ver ficha
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {hasMoreMobileRows && (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + 6)}
                className="w-full rounded-xl btn-3d-pill-inactive py-4 text-sm uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-sm"
              >
                Cargar mas hermanos
              </button>
            )}
          </div>

          <div className="hidden md:block bg-gradient-to-br from-white/90 via-sky-50/60 to-emerald-50/40 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 backdrop-blur-2xl rounded-2xl border border-white/70 dark:border-white/15 overflow-hidden shadow-[0_20px_50px_rgba(2,132,199,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.65)] relative">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-black/50 text-slate-600 dark:text-gray-300 text-sm uppercase tracking-wider font-black border-b border-slate-200/80 dark:border-white/10">
                    <th className="px-8 py-5">Líder / Hermano</th>
                    <th className="px-8 py-5">Ubicación / Célula</th>
                    <th className="px-8 py-5">Etapa espiritual</th>
                    <th className="px-8 py-5">Responsable</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                  {filteredBrothers.map((brother) => (
                    <tr key={brother.id} onClick={() => navigate(`/hermanos/${brother.id}`)} className="hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-all cursor-pointer group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 md:w-[68px] md:h-[68px] rounded-2xl overflow-hidden border border-white/70 dark:border-white/20 shadow-md shrink-0 bg-slate-200 dark:bg-slate-800 relative group-hover:scale-105 transition-transform">
                            <img
                              src={brother.fotoUrl || getAvatarForBrother(brother.name)}
                              alt={brother.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <BrotherNameTrigger
                              name={brother.name}
                              className="font-black text-slate-900 dark:text-white text-2xl leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                              fallbackClassName="font-black text-slate-900 dark:text-white text-2xl leading-tight"
                            />
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-extrabold tracking-wider mt-1 uppercase">Miembro activo</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-600 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 dark:text-gray-100 text-lg">{brother.cellName}</span>
                          <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-gray-400 tracking-wider">Zona Norte - CMV</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-5 py-2.5 rounded-xl text-sm uppercase tracking-wider font-black border transition-all duration-300 shadow-sm ${STAGE_COLORS[brother.procesoActual]}`}>
                          {brother.procesoActual}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                          <BrotherNameTrigger
                            name={brother.acompananteName || 'No asig.'}
                            className="text-slate-700 dark:text-gray-200 text-base font-black uppercase tracking-wider hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            fallbackClassName="text-slate-700 dark:text-gray-200 text-base font-black uppercase tracking-wider"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center btn-3d-pill-inactive text-slate-500 dark:text-gray-400 group-hover:bg-[#059669] group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={22} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isLoadingBrothers && (
        <div className="p-10 md:p-16 text-center animate-in fade-in zoom-in-95 duration-500 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-[#0d1829]/95 dark:to-[#060c17]/95 rounded-xl border border-slate-200 dark:border-white/5 shadow-xl">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Cargando hermanos...</p>
        </div>
      )}

      {!isLoadingBrothers && filteredBrothers.length === 0 && (
        <div className="p-10 md:p-24 text-center animate-in fade-in zoom-in-95 duration-500 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-[#0d1829]/95 dark:to-[#060c17]/95 rounded-xl border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
            <Search className="text-emerald-600/60 dark:text-emerald-400/60" size={32} />
          </div>
          <h3 className="text-slate-900 dark:text-white font-black text-xl mb-2 uppercase tracking-tight">Cero resultados</h3>
          <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto text-sm font-medium leading-relaxed">No encontramos a nadie con ese criterio en el sistema de seguimiento.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStage('Todas');
            }}
            className="mt-6 btn-3d-emerald text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Cierre del contenedor centralizado */}
      </div>

      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Resumen">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Total</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Altar</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.altar}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Grupo</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.grupo}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Experiencia</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.experiencia}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">EDDI</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.eddi}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Discipulo</p>
            <p className="text-xl font-black text-[#c5a059] mt-1">{summaryByStage.discipulo}</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isStageFilterModalOpen} onClose={() => setIsStageFilterModalOpen(false)} title="Filtros" size="sm">
        <div className="space-y-4 py-1">
          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">Selecciona la etiqueta de filtrado.</p>
          <div className="grid grid-cols-2 gap-3">
            {STAGES.map((stage) => {
              const isSelected = selectedStage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => {
                    setSelectedStage(stage);
                    setIsStageFilterModalOpen(false);
                  }}
                  className={`px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200 ${
                    isSelected
                      ? 'btn-3d-pill-active shadow-lg shadow-emerald-500/25'
                      : 'btn-3d-pill-inactive text-slate-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40'
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Incorporacion de Hermano">
        <form onSubmit={handleSaveBrother} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Nombre completo</label>
              <input
                type="text"
                placeholder="Ej: David Livingstone"
                required
                value={newBrotherName}
                onChange={(event) => setNewBrotherName(event.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] p-4.5 sm:p-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Fecha de nacimiento</label>
              <input
                type="date"
                value={newBrotherBirthDate}
                onChange={(event) => setNewBrotherBirthDate(event.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] p-4.5 sm:p-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Fecha de ingreso</label>
              <input
                type="date"
                required
                value={newBrotherDate}
                onChange={(event) => setNewBrotherDate(event.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] p-4.5 sm:p-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Celula asignada</label>
              <select
                value={newBrotherCell}
                onChange={(event) => setNewBrotherCell(event.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] p-4.5 sm:p-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                {cellOptions.map((cell) => (
                  <option key={cell} value={cell}>
                    {cell}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">Etapa inicial</label>
              <select
                value={newBrotherStage}
                onChange={(event) => setNewBrotherStage(event.target.value as InitialStage)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] p-4.5 sm:p-5 text-base font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="Altar">Altar</option>
                <option value="Grupo">Grupo</option>
                <option value="Experiencia">Experiencia</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/5">
            <button
              type="submit"
              disabled={isSavingBrother}
              className="w-full py-4.5 btn-3d-emerald text-white text-base font-black rounded-2xl hover:brightness-105 active:scale-[0.98] transition-all shadow-xl uppercase tracking-widest"
            >
              {isSavingBrother ? 'Guardando...' : 'Confirmar alta en el sistema'}
            </button>
          </div>
        </form>
      </Modal>

      <RecursosModal
        isOpen={isRecursosModalOpen}
        onClose={() => setIsRecursosModalOpen(false)}
        onNotify={(msg, type = 'success') => {
          setToastMessage(msg);
          setToastType(type);
          setShowToast(true);
        }}
      />

      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type={toastType} />
    </div>
  );
};
