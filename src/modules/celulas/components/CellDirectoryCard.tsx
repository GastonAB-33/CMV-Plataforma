import React, { useMemo, useState, useEffect } from 'react';
import {
  Crown,
  ChevronDown,
  ChevronRight,
  Users,
} from 'lucide-react';
import { getCellBranding } from '../cellBranding';
import { BrotherListItem } from '../../hermanos/types';
import { getAvatarForBrother } from '../../../services/avatarService';
import {
  CellGrupoVida,
  getGruposVidaForCell,
} from '../services/cellGruposVidaService';

export interface CellGroupView {
  id: string;
  nombre: string;
  activa: boolean;
  leaders: { id: string; name: string; fotoUrl?: string; role?: string }[];
  members: BrotherListItem[];
  totalMembers: number;
}

interface CellDirectoryCardProps {
  cell: CellGroupView;
  onNavigateBrother: (id: string) => void;
  onNavigateGeneral: () => void;
  onSelectLeader?: (leader: { id: string; name: string; fotoUrl?: string; role?: string }, cellName?: string) => void;
  onSelectGrupoVida: (grupo: CellGrupoVida) => void;
  isInitiallyExpanded?: boolean;
}

export const CellDirectoryCard: React.FC<CellDirectoryCardProps> = ({
  cell,
  onNavigateBrother,
  onNavigateGeneral,
  onSelectLeader,
  onSelectGrupoVida,
  isInitiallyExpanded = false,
}) => {
  const brand = getCellBranding(cell.nombre);
  const LogoIcon = brand.Icon;

  // Estado de despliegue del panel
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  // Sincronizar si cambia el prop isInitiallyExpanded (ej. al desplazarse desde la Red Apostólica)
  useEffect(() => {
    if (isInitiallyExpanded) {
      setIsExpanded(true);
    }
  }, [isInitiallyExpanded]);

  // Resolver los Grupos de Vida pertenecientes a esta célula
  const gruposVida = useMemo(() => getGruposVidaForCell(cell), [cell]);

  const handleCardClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      id={`cell-card-${brand.key}`}
      data-cell-id={cell.id}
      className={`relative group/card overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/20 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 transition-all duration-300 flex flex-col justify-between scroll-mt-24 ${
        !isExpanded ? 'hover:-translate-y-1.5 cursor-pointer' : ''
      }`}
      onClick={!isExpanded ? handleCardClick : undefined}
      title={!isExpanded ? `Haz clic para desplegar los Grupos de Vida de ${brand.displayName}` : undefined}
    >
      {/* 1. Degradé envolvente sutil en la parte de atrás para dar relieve tridimensional */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/10 via-[#06b6d4]/5 to-transparent pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* 2. PANEL PRINCIPAL SUPERIOR (IMAGEN 2) */}
      <div
        className={`relative z-10 p-5 sm:p-6 md:p-7 bg-gradient-to-r ${brand.theme.headerGradient} space-y-5 transition-colors ${
          isExpanded ? 'border-b border-cyan-500/20 dark:border-white/10' : ''
        }`}
      >
        {/* PARTE SUPERIOR: Logo distintivo + Insignia de Célula */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Logo de la célula ampliado y con relieve de halo */}
            <div
              className={`p-3 sm:p-3.5 rounded-3xl bg-white dark:bg-[#07131f] border border-cyan-500/30 dark:border-cyan-400/40 shadow-lg ${brand.theme.glowColor} group-hover/card:scale-105 transition-transform duration-300 shrink-0`}
            >
              <LogoIcon size={64} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs sm:text-sm font-black uppercase tracking-[0.25em] ${brand.theme.primaryClass}`}>
                  Célula de Vida
                </span>
                <span className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 font-black">
                  • {brand.biblicalRef}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {brand.displayName}
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-bold text-slate-600 dark:text-cyan-100/90 leading-snug">
                {brand.tagline}
              </p>
            </div>
          </div>

          {/* Contador total de miembros de la célula */}
          <span
            className={`self-start px-4 py-1.5 rounded-full ${brand.theme.bgBadgeClass} ${brand.theme.borderBadgeClass} border ${brand.theme.textClass} text-xs sm:text-sm font-black shrink-0 shadow-sm`}
          >
            {cell.totalMembers} {cell.totalMembers === 1 ? 'hermano' : 'hermanos'}
          </span>
        </div>

        {/* Líderes Responsables de la Célula ampliados */}
        <div className="pt-4 border-t border-cyan-500/20 dark:border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-300 mb-2.5">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-cyan-500 dark:text-cyan-300" />
              <span>Líderes Responsables</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold lowercase">
                cobertura pastoral
              </span>
              {!isExpanded && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30">
                  <span>{gruposVida.length} Grupos</span>
                  <ChevronDown size={13} className="animate-pulse" />
                </span>
              )}
            </div>
          </div>

          {cell.leaders.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {cell.leaders.map((leader) => (
                <div
                  key={leader.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Evita desplegar/colapsar la tarjeta al hacer clic en el líder
                    if (onSelectLeader) {
                      onSelectLeader(leader, cell.nombre);
                    } else {
                      onNavigateBrother(leader.id);
                    }
                  }}
                  title={`Ver detalles de ${leader.name}`}
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 text-slate-900 dark:text-cyan-100 text-xs sm:text-sm font-extrabold cursor-pointer hover:border-cyan-400 transition-all shadow-xs hover:scale-[1.03] active:scale-[0.98]"
                >
                  <img
                    src={getAvatarForBrother(leader.name, leader.fotoUrl)}
                    alt={leader.name}
                    className="w-7 h-7 sm:w-8 h-8 rounded-full object-cover border border-cyan-400/40"
                  />
                  <span>{leader.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm italic text-slate-600 dark:text-gray-300">
              Liderazgo en proceso de designación
            </p>
          )}
        </div>
      </div>

      {/* 3. PANEL DESPLEGADO DE GRUPOS DE VIDA (IMAGEN 3) - SÓLO SE MUESTRA AL ESTAR DESPLEGADO */}
      {isExpanded && (
        <div className="relative z-10 p-5 sm:p-6 bg-white dark:bg-[#091522] flex-1 flex flex-col justify-between animate-in slide-in-from-top-3 duration-300 space-y-4">
          <div>
            {/* Botón superior para plegar / ocultar grupos */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/40 hover:bg-cyan-100/90 dark:hover:bg-cyan-900/50 border border-cyan-200/90 dark:border-cyan-400/30 text-slate-800 dark:text-cyan-200 transition-all duration-300 shadow-sm cursor-pointer group/toggle"
              aria-expanded="true"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00dfa2] flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider block text-slate-900 dark:text-white">
                    Grupos de Vida
                  </span>
                  <span className="text-xs text-slate-500 dark:text-cyan-200/70 font-medium">
                    Clic para ocultar grupos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 shadow-xs">
                  {gruposVida.length} {gruposVida.length === 1 ? 'Grupo' : 'Grupos'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900 border border-cyan-300 dark:border-cyan-400/40 flex items-center justify-center text-[#00dfa2] shadow-xs">
                  <ChevronDown size={18} className="rotate-180" />
                </div>
              </div>
            </button>

            {/* Subcabecera y listado de Grupos de Vida */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-cyan-200/80 px-1">
                <span>Grupos de Vida de la Célula</span>
                <span>Miembros</span>
              </div>

              <div className="space-y-2.5">
                {gruposVida.map((grupo) => (
                  <div
                    key={grupo.id}
                    onClick={() => onSelectGrupoVida(grupo)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#071726] hover:bg-cyan-50/70 dark:hover:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-400/30 hover:border-cyan-400 shadow-md hover:shadow-cyan-500/15 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 group/item hover:scale-[1.01] active:scale-[0.99]"
                    title={`Ver hermanos de ${grupo.nombre}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={getAvatarForBrother(grupo.lider.name, grupo.lider.fotoUrl)}
                        alt={grupo.lider.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shrink-0 border border-cyan-400/50 shadow-xs"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-300 transition-colors">
                          {grupo.nombre}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-300 font-medium truncate">
                          Líder: <strong className="text-slate-800 dark:text-cyan-200 font-bold">{grupo.lider.name}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-[#00dfa2] border border-cyan-300 dark:border-cyan-400/40 text-xs sm:text-sm font-black shadow-xs">
                        {grupo.totalMembers} {grupo.totalMembers === 1 ? 'miembro' : 'miembros'}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-slate-400 group-hover/item:text-cyan-500 group-hover/item:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie de célula */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
            <span>Identidad: {brand.displayName}</span>
            <button
              type="button"
              onClick={onNavigateGeneral}
              className="font-bold text-cyan-600 dark:text-cyan-300 hover:text-emerald-500 hover:underline transition-colors cursor-pointer"
            >
              Ver en padrón general →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
