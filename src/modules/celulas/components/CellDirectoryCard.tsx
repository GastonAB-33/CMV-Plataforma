import React from 'react';
import { Crown, ChevronRight, Users } from 'lucide-react';
import { getCellBranding } from '../cellBranding';
import { BrotherListItem } from '../../hermanos/types';
import { getAvatarForBrother } from '../../../services/avatarService';
import { STAGE_COLORS } from '../../../theme/stages';

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
}

export const CellDirectoryCard: React.FC<CellDirectoryCardProps> = ({
  cell,
  onNavigateBrother,
  onNavigateGeneral,
}) => {
  const brand = getCellBranding(cell.nombre);
  const LogoIcon = brand.Icon;

  return (
    <div className="relative group/card overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/20 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between">
      {/* 1. Degradé envolvente sutil en la parte de atrás para dar relieve tridimensional */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/10 via-[#06b6d4]/5 to-transparent pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* 2. Encabezado con Identidad Visual y Logo Ampliado en la parte superior */}
      <div
        className={`relative z-10 p-5 sm:p-6 md:p-7 bg-gradient-to-r ${brand.theme.headerGradient} border-b border-cyan-500/20 dark:border-white/10 space-y-5`}
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

          {/* Contador de miembros ampliado */}
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
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold lowercase">
              cobertura pastoral
            </span>
          </div>

          {cell.leaders.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {cell.leaders.map((leader) => (
                <div
                  key={leader.id}
                  onClick={() => onNavigateBrother(leader.id)}
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 text-slate-900 dark:text-cyan-100 text-xs sm:text-sm font-extrabold cursor-pointer hover:border-cyan-400 transition-all shadow-xs hover:scale-[1.03]"
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

      {/* 3. Lista ordenada de los hermanos pertenecientes a esta célula ampliada */}
      <div className="relative z-10 p-5 sm:p-6 md:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-cyan-200 mb-3.5">
            <span>Hermanos de la Célula</span>
            <span>Etapa Actual</span>
          </div>

          {cell.members.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Users size={32} className="mx-auto text-slate-300 dark:text-cyan-700/60" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 italic font-medium">
                No hay hermanos asignados a esta célula actualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {cell.members.map((member) => {
                const stageClass =
                  STAGE_COLORS[member.procesoActual] ||
                  'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={member.id}
                    onClick={() => onNavigateBrother(member.id)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-cyan-950/30 border border-slate-100 dark:border-white/5 hover:border-cyan-400/30 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getAvatarForBrother(member.name, member.fotoUrl)}
                        alt={member.name}
                        className="w-10 h-10 sm:w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-cyan-400/30 shadow-xs"
                      />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                          {member.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${stageClass}`}
                      >
                        {member.procesoActual}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie de célula */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
          <span>Identidad: {brand.displayName}</span>
          <button
            type="button"
            onClick={onNavigateGeneral}
            className="font-bold text-cyan-600 dark:text-cyan-300 hover:text-emerald-500 hover:underline transition-colors"
          >
            Ver en padrón general →
          </button>
        </div>
      </div>
    </div>
  );
};
