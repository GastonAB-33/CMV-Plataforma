import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  Users,
  ChevronDown,
  ChevronRight,
  Crown,
  Home,
  Calendar,
  MapPin,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  User,
} from 'lucide-react';
import { CellGroupView } from './CellDirectoryCard';
import { CellGrupoVida, getGruposVidaForCell } from '../services/cellGruposVidaService';
import { CellLogoBadge, getCellBranding } from '../cellBranding';
import { getAvatarForBrother } from '../../../services/avatarService';
import { STAGE_COLORS } from '../../../theme/stages';
import { Proceso } from '../../../types';

interface CellDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: CellGroupView | null;
  onNavigateBrother: (id: string) => void;
  onSelectLeader?: (leader: { id: string; name: string; fotoUrl?: string; role?: string }, cellName?: string) => void;
  onSelectGrupoVida?: (grupo: CellGrupoVida) => void;
  onScrollToCellCard?: (cellKey: string) => void;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  isOpen,
  onClose,
  cell,
  onNavigateBrother,
  onSelectLeader,
  onSelectGrupoVida,
  onScrollToCellCard,
}) => {
  // Pestaña activa dentro del modal: 'grupos' (Grupos de Vida) o 'discipulos' (Lista completa)
  const [activeTab, setActiveTab] = useState<'grupos' | 'discipulos'>('grupos');

  // Control de grupos de vida expandidos (acordeón para profundizar en cada grupo)
  const [expandedGrupoIds, setExpandedGrupoIds] = useState<Record<string, boolean>>({});

  // Filtros para la pestaña de discípulos completos
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('todos');

  // Resolver los Grupos de Vida de esta célula
  const gruposVida = useMemo(() => {
    if (!cell) return [];
    return getGruposVidaForCell(cell);
  }, [cell]);

  // Al abrir o cambiar de célula, inicializar: por defecto todos los grupos abiertos para visibilidad inmediata
  useEffect(() => {
    if (isOpen && gruposVida.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      gruposVida.forEach((g) => {
        initialExpanded[g.id] = true;
      });
      setExpandedGrupoIds(initialExpanded);
      setActiveTab('grupos');
      setSearchQuery('');
      setSelectedStage('todos');
    }
  }, [isOpen, cell, gruposVida]);

  // Manejo de la tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cell) return null;

  const brand = getCellBranding(cell.nombre);
  const allMembers = cell.members || [];

  // Alternar el despliegue de un Grupo de Vida interno
  const toggleGrupo = (grupoId: string) => {
    setExpandedGrupoIds((prev) => ({
      ...prev,
      [grupoId]: !prev[grupoId],
    }));
  };

  // Filtrado de discípulos en la pestaña de Lista Completa
  const filteredDisciples = allMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.acompananteName &&
        member.acompananteName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage =
      selectedStage === 'todos' || member.procesoActual === selectedStage;

    return matchesSearch && matchesStage;
  });

  // Etapas presentes en esta célula para los filtros rápidos
  const availableStages = Array.from(
    new Set(allMembers.map((m) => m.procesoActual).filter(Boolean))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cell-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#031522] via-[#062030] to-[#041a27] text-white border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 p-5 sm:p-7 md:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luces de fondo y resplandores para relieve 3D */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00dfa2]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* 1. BARRA SUPERIOR: Logo + Nombre + Botón Cerrar */}
        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-cyan-400/20 pb-5">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="shrink-0 p-2 sm:p-2.5 rounded-3xl bg-cyan-950/80 border border-cyan-400/50 shadow-xl shadow-cyan-500/20">
              <CellLogoBadge cellName={cell.nombre} size="lg" showGlow={true} />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#00dfa2] flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Célula de Vida</span>
                </span>
                <span className="text-xs sm:text-sm text-cyan-300 font-extrabold">
                  • {brand.biblicalRef}
                </span>
              </div>

              <h2
                id="cell-modal-title"
                className="text-2xl sm:text-4xl font-black text-white tracking-tight truncate leading-tight"
              >
                {brand.displayName}
              </h2>

              <p className="text-xs sm:text-sm text-cyan-200/80 font-medium truncate">
                {brand.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana emergente"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-md"
          >
            <X size={22} />
          </button>
        </div>

        {/* 2. CABECERA RESUMEN: Estadísticas rápidas y Líderes a cargo */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Cantidad de Discípulos */}
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
                Padrón de Discípulos
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#00dfa2] leading-none mt-1">
                {cell.totalMembers}
              </p>
              <span className="text-[11px] text-cyan-200/70 font-semibold">
                {cell.totalMembers === 1 ? 'hermano registrado' : 'hermanos registrados'}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-[#00dfa2] flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Grupos de Vida activos */}
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
                Grupos de Vida
              </span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-200 leading-none mt-1">
                {gruposVida.length}
              </p>
              <span className="text-[11px] text-cyan-200/70 font-semibold">
                {gruposVida.length === 1 ? 'grupo activo en hogares' : 'grupos activos en hogares'}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
          </div>

          {/* Card 3: Líderes Responsables */}
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-300">
              <Crown size={14} className="text-[#00dfa2]" />
              <span>Liderazgo Responsable:</span>
            </div>

            {cell.leaders.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cell.leaders.map((leader) => (
                  <div
                    key={leader.id}
                    onClick={() => {
                      if (onSelectLeader) {
                        onSelectLeader(leader, cell.nombre);
                      } else {
                        onNavigateBrother(leader.id);
                      }
                    }}
                    title={`Ver perfil de ${leader.name}`}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-400/40 hover:border-cyan-300 text-white text-xs font-bold cursor-pointer transition-all hover:scale-105"
                  >
                    <img
                      src={getAvatarForBrother(leader.name, leader.fotoUrl)}
                      alt={leader.name}
                      className="w-5 h-5 rounded-full object-cover border border-cyan-400/50"
                    />
                    <span className="truncate max-w-[120px]">{leader.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-cyan-200/70">
                Liderazgo en proceso de confirmación
              </p>
            )}
          </div>
        </div>

        {/* 3. SELECTOR DE PESTAÑAS (PROFUNDIZAR MÁS) */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-400/20 pb-3">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/30">
            <button
              type="button"
              onClick={() => setActiveTab('grupos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'grupos'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/20 text-[#00dfa2] border border-[#00dfa2]/60 shadow-md'
                  : 'text-cyan-200 hover:text-white hover:bg-cyan-900/40'
              }`}
            >
              <Layers size={16} />
              <span>Grupos de Vida ({gruposVida.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discipulos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'discipulos'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/20 text-[#00dfa2] border border-[#00dfa2]/60 shadow-md'
                  : 'text-cyan-200 hover:text-white hover:bg-cyan-900/40'
              }`}
            >
              <Users size={16} />
              <span>Lista Completa de Discípulos ({allMembers.length})</span>
            </button>
          </div>

          <span className="text-xs text-cyan-200/70 font-semibold hidden sm:inline">
            {activeTab === 'grupos'
              ? 'Toca un grupo para desplegar sus integrantes'
              : 'Explora y busca entre todos los discípulos de la célula'}
          </span>
        </div>

        {/* 4. CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="relative z-10 space-y-4">
          {/* ============================================================== */}
          {/* PESTAÑA A: GRUPOS DE VIDA CON INTEGRANTES DESPLEGABLES          */}
          {/* ============================================================== */}
          {activeTab === 'grupos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">
                  Grupos de Vida pertenecientes a la Célula{' '}
                  <strong className="text-white font-extrabold">{brand.displayName}</strong>.
                  Toca cada grupo para ver sus hermanos asignados.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('discipulos')}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#00dfa2] hover:text-emerald-300 hover:underline transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span>Ver padrón completo ({allMembers.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {gruposVida.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-cyan-950/40 border border-cyan-400/20 p-6 space-y-2">
                  <Layers size={36} className="mx-auto text-cyan-400/50" />
                  <p className="text-base font-bold text-white">
                    No hay Grupos de Vida registrados para esta célula
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {gruposVida.map((grupo) => {
                    const isExpanded = Boolean(expandedGrupoIds[grupo.id]);
                    return (
                      <div
                        key={grupo.id}
                        className="rounded-2xl bg-cyan-950/50 border border-cyan-400/30 overflow-hidden shadow-md transition-all duration-200"
                      >
                        {/* Cabecera del Grupo de Vida (Interactiva para desplegar) */}
                        <div
                          onClick={() => toggleGrupo(grupo.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-cyan-900/40 transition-colors select-none group"
                          title="Toca para desplegar u ocultar los integrantes de este grupo de vida"
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <img
                              src={getAvatarForBrother(grupo.lider.name, grupo.lider.fotoUrl)}
                              alt={grupo.lider.name}
                              className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-cyan-400/50 shadow-sm"
                            />

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                                  {grupo.nombre}
                                </h3>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cyan-200/80">
                                <span className="font-semibold">
                                  Líder:{' '}
                                  <strong className="text-white font-bold">
                                    {grupo.lider.name}
                                  </strong>
                                </span>
                                {grupo.anfitrion && (
                                  <span className="flex items-center gap-1">
                                    <Home size={12} className="text-[#00dfa2]" />
                                    <span>{grupo.anfitrion}</span>
                                  </span>
                                )}
                                {grupo.horario && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} className="text-cyan-300" />
                                    <span>{grupo.horario}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cyan-500/20">
                            <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[#00dfa2] text-xs sm:text-sm font-black shadow-xs">
                              {grupo.totalMembers} {grupo.totalMembers === 1 ? 'integrante' : 'integrantes'}
                            </span>

                            <div className="w-8 h-8 rounded-xl bg-cyan-900/70 border border-cyan-400/30 flex items-center justify-center text-[#00dfa2] shadow-xs group-hover:bg-[#00dfa2] group-hover:text-black transition-colors">
                              <ChevronDown
                                size={18}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : 'rotate-0'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contenido desplegado: Lista de Miembros de este Grupo */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 bg-black/30 border-t border-cyan-400/20 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-cyan-300 px-1">
                              <span>Hermanos integrantes de este grupo ({grupo.members.length})</span>
                              <span className="text-[11px] text-cyan-200/60 lowercase">
                                toca un hermano para ver su perfil
                              </span>
                            </div>

                            {grupo.members.length === 0 ? (
                              <div className="py-6 text-center rounded-xl bg-white/5 border border-cyan-400/20 p-4 space-y-1">
                                <Users size={24} className="mx-auto text-cyan-400/40" />
                                <p className="text-xs sm:text-sm text-cyan-200/80">
                                  No hay hermanos asignados actualmente a este grupo de vida.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                                {grupo.members.map((member) => {
                                  const stageClass =
                                    STAGE_COLORS[member.procesoActual] ||
                                    'bg-slate-500/10 text-slate-300 border-slate-500/30';
                                  return (
                                    <div
                                      key={member.id}
                                      onClick={() => {
                                        onClose();
                                        onNavigateBrother(member.id);
                                      }}
                                      className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/30 hover:border-cyan-300 cursor-pointer transition-all duration-150 group/item shadow-xs hover:scale-[1.01]"
                                      title={`Ver ficha completa de ${member.name}`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <img
                                          src={getAvatarForBrother(member.name, member.fotoUrl)}
                                          alt={member.name}
                                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-cyan-400/40"
                                        />
                                        <div className="min-w-0">
                                          <p className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-cyan-300 transition-colors">
                                            {member.name}
                                          </p>
                                          <p className="text-[11px] text-cyan-200/70 truncate">
                                            {member.acompananteName
                                              ? `Acomp.: ${member.acompananteName}`
                                              : 'En discipulado'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span
                                          className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${stageClass}`}
                                        >
                                          {member.procesoActual}
                                        </span>
                                        <ChevronRight
                                          size={15}
                                          className="text-cyan-400/60 group-hover/item:text-[#00dfa2] transition-colors"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* PESTAÑA B: LISTA COMPLETA DE DISCÍPULOS DE LA CÉLULA           */}
          {/* ============================================================== */}
          {activeTab === 'discipulos' && (
            <div className="space-y-4">
              {/* Buscador y Filtros de Etapa Espiritual */}
              <div className="space-y-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar discípulo por nombre o acompañante..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 text-white placeholder-cyan-300/50 text-xs sm:text-sm focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/25 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-white text-xs font-black uppercase"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Filtro rápido por Etapas Espirituales */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedStage('todos')}
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                      selectedStage === 'todos'
                        ? 'bg-[#00dfa2] text-black shadow-sm'
                        : 'bg-cyan-950/60 text-cyan-200 border border-cyan-400/30 hover:border-cyan-300'
                    }`}
                  >
                    Todos ({allMembers.length})
                  </button>
                  {availableStages.map((stage) => {
                    const count = allMembers.filter((m) => m.procesoActual === stage).length;
                    const isSelected = selectedStage === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedStage(stage)}
                        className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00dfa2] text-black shadow-sm'
                            : 'bg-cyan-950/60 text-cyan-200 border border-cyan-400/30 hover:border-cyan-300'
                        }`}
                      >
                        {stage} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Listado de Discípulos Filtrados */}
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-cyan-300 px-1">
                <span>Mostrando {filteredDisciples.length} de {allMembers.length} discípulos</span>
                <span className="text-[11px] text-cyan-200/60 lowercase">
                  haz clic para abrir ficha completa
                </span>
              </div>

              {filteredDisciples.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-cyan-950/40 border border-cyan-400/20 p-6 space-y-2">
                  <Users size={36} className="mx-auto text-cyan-400/50" />
                  <p className="text-base font-bold text-white">
                    No se encontraron discípulos con ese filtro
                  </p>
                  <p className="text-xs text-cyan-200/70">
                    Intenta buscar con otro nombre o selecciona &quot;Todos&quot;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredDisciples.map((member) => {
                    const stageClass =
                      STAGE_COLORS[member.procesoActual] ||
                      'bg-slate-500/10 text-slate-300 border-slate-500/30';
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          onClose();
                          onNavigateBrother(member.id);
                        }}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/30 hover:border-cyan-300 cursor-pointer transition-all duration-200 group/disciple shadow-xs hover:scale-[1.01]"
                        title={`Ver detalles de ${member.name}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={getAvatarForBrother(member.name, member.fotoUrl)}
                            alt={member.name}
                            className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-cyan-400/40 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-black text-white truncate group-hover/disciple:text-cyan-300 transition-colors">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-cyan-200/70 truncate">
                              {member.acompananteName
                                ? `Acomp.: ${member.acompananteName}`
                                : 'En discipulado'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-xl border ${stageClass}`}
                          >
                            {member.procesoActual}
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-cyan-400/60 group-hover/disciple:text-[#00dfa2] transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. PIE DE PANTALLA EMERGENTE */}
        <div className="relative z-10 pt-3 border-t border-cyan-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {onScrollToCellCard ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onScrollToCellCard(brand.key);
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-[#00dfa2] transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Ver célula desplegada en la página principal ↓</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer self-end sm:self-auto shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
