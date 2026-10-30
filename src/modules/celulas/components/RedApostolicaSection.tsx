import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';
import { CellLogoBadge, getCellBranding, RedApostolicaLogo } from '../cellBranding';
import { BrotherListItem } from '../../hermanos/types';
import { getAvatarForBrother } from '../../../services/avatarService';
import { STAGE_COLORS } from '../../../theme/stages';

interface RedApostolicaSectionProps {
  apostolicGroup?: {
    id: string;
    nombre: string;
    leaders: { id: string; name: string; fotoUrl?: string; role?: string }[];
    members: BrotherListItem[];
    totalMembers: number;
  };
  daughterCells: { id: string; nombre: string; totalMembers: number }[];
  onSelectLeader?: (leader: { id: string; name: string; fotoUrl?: string; role?: string }) => void;
  onSelectCell?: (cellKey: string) => void;
}

export const RedApostolicaSection: React.FC<RedApostolicaSectionProps> = ({
  apostolicGroup,
  daughterCells,
  onSelectLeader,
  onSelectCell,
}) => {
  const navigate = useNavigate();
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const leaders = apostolicGroup?.leaders ?? [];
  const members = apostolicGroup?.members ?? [];
  const totalMembers = apostolicGroup?.totalMembers ?? members.length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#031522] via-[#062030] to-[#041a27] text-white border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:-translate-y-1 transition-all duration-500">
      {/* 1. Degradé envolvente y resplandores en la parte de atrás para relieve */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00dfa2]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 2. Franja superior con distintivo en Turquesa & Cian */}
      <div className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-transparent border-b border-cyan-400/25 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-black uppercase tracking-wider">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <Crown size={18} className="text-cyan-300 animate-pulse" />
          <span>Red Apostólica CMV • Cobertura Pastoral</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-cyan-200 text-xs font-extrabold">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Cobertura Espiritual de Liderazgo</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 md:p-9 space-y-7">
        {/* Cabecera principal: Logo Ampliado + Título Mayor + Definición Mayor */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5 sm:gap-6">
            {/* Logo de la Red Apostólica ampliado y con halo flotante */}
            <div className="relative shrink-0 p-3 sm:p-4 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-[#072437] to-[#041a27] border border-cyan-400/50 shadow-xl shadow-cyan-500/25">
              <RedApostolicaLogo size={76} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 text-xs font-black uppercase tracking-widest">
                <Sparkles size={13} className="text-[#00dfa2]" />
                <span>Raíz & Cobertura de Células</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                Red Apostólica
              </h2>
            </div>
          </div>

          {/* Estadísticas de cobertura ampliadas */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 bg-cyan-950/40 border border-cyan-400/30 rounded-3xl p-4 sm:px-6 sm:py-3.5 shadow-lg">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-200/90">
              Hermanos en Cobertura
            </span>
            <span className="text-3xl sm:text-4xl font-black text-cyan-300 leading-none">
              {totalMembers} {totalMembers === 1 ? 'hermano' : 'hermanos'}
            </span>
          </div>
        </div>

        {/* Líderes portadores de la Cobertura Apostólica ampliados */}
        <div className="pt-5 border-t border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
              <Crown size={16} />
              <span>Liderazgo de Cobertura (Portadores de la Red Apostólica)</span>
            </div>
            <span className="text-xs sm:text-sm text-cyan-200/80 font-semibold hidden sm:inline">
              Envían y supervisan los Grupos de Vida
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {leaders.length > 0 ? (
              leaders.map((leader) => (
                <div
                  key={leader.id}
                  onClick={() => (onSelectLeader ? onSelectLeader(leader) : navigate(`/hermanos/${leader.id}`))}
                  title={`Ver detalles de ${leader.name}`}
                  className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 hover:border-cyan-300 text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 shadow-md hover:scale-[1.03] active:scale-[0.98]"
                >
                  <img
                    src={getAvatarForBrother(leader.name, leader.fotoUrl)}
                    alt={leader.name}
                    className="w-7 h-7 sm:w-8 h-8 rounded-full object-cover border-2 border-cyan-400/60"
                  />
                  <span>{leader.name}</span>
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/30 text-cyan-100">
                    {leader.role || 'Apóstol'}
                  </span>
                </div>
              ))
            ) : (
              <div
                onClick={() =>
                  onSelectLeader
                    ? onSelectLeader({ id: '1', name: 'Apostol Guillermo', role: 'Apóstol' })
                    : navigate('/hermanos/1')
                }
                title="Ver detalles de Apostol Guillermo"
                className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 hover:border-cyan-300 text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-all duration-200 shadow-md"
              >
                <img
                  src={getAvatarForBrother('Apostol Guillermo')}
                  alt="Apostol Guillermo"
                  className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/60"
                />
                <span>Apostol Guillermo</span>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/30 text-cyan-100">
                  Apóstol
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Derivación hacia las Células (Árbol de Vida) con relieve */}
        <div className="p-5 rounded-3xl bg-cyan-950/40 border border-cyan-400/30 space-y-3.5 shadow-md">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-100">
            <GitBranch size={16} className="text-[#00dfa2]" />
            <span>Células que nacen y se arraigan de esta Cobertura Apostólica:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {daughterCells.map((cell) => {
              const brand = getCellBranding(cell.nombre);
              return (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => onSelectCell?.(brand.key)}
                  title={`Desplazarse a la célula ${brand.displayName}`}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 hover:border-cyan-300 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer group"
                >
                  <CellLogoBadge cellName={cell.nombre} size="sm" showGlow={false} />
                  <span className="text-white font-extrabold group-hover:text-cyan-300 transition-colors">
                    {brand.displayName}
                  </span>
                  <span className="text-xs text-cyan-300 font-black">
                    ({cell.totalMembers})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hermanos bajo Cobertura Apostólica (Colapsable ampliado) */}
        {members.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsMembersOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-400/30 text-xs sm:text-sm font-black text-cyan-200 hover:text-white transition-colors"
            >
              <span>
                {isMembersOpen ? 'Ocultar' : 'Ver'} hermanos bajo Cobertura Apostólica ({members.length})
              </span>
              {isMembersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isMembersOpen && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-300">
                {members.map((member) => {
                  const stageClass =
                    STAGE_COLORS[member.procesoActual] ||
                    'bg-slate-800 text-slate-200 border-slate-700';
                  return (
                    <div
                      key={member.id}
                      onClick={() => navigate(`/hermanos/${member.id}`)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-cyan-950/60 border border-white/5 hover:border-cyan-400/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAvatarForBrother(member.name, member.fotoUrl)}
                          alt={member.name}
                          className="w-8 h-8 sm:w-9 h-9 rounded-2xl object-cover shrink-0 border border-cyan-400/30"
                        />
                        <span className="text-xs sm:text-sm font-bold truncate text-slate-100 hover:text-cyan-300">
                          {member.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-lg border ${stageClass}`}
                      >
                        {member.procesoActual}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Alias compatible
export const RedApostolicaMotherSection = RedApostolicaSection;
