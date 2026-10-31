import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { CellLogoBadge, getCellBranding, RedApostolicaLogo } from '../cellBranding';
import { getAvatarForBrother } from '../../../services/avatarService';
import { CellGroupView } from './CellDirectoryCard';
import { getGruposVidaForCell } from '../services/cellGruposVidaService';

export interface FormativeLeader {
  id: string;
  name: string;
  role: string;
  cellName: string;
  fotoUrl?: string;
}

// 15 líderes en formación de la Célula Red Apostólica (los líderes de las otras células)
export const CANONICAL_15_LEADERS: FormativeLeader[] = [
  { id: 'lider-calivar', name: 'Emanuel Calivar Chanampa', role: 'Pastor / Líder de Célula', cellName: 'Saetas' },
  { id: 'lider-marcos', name: 'Marcos Guajardo', role: 'Líder de Célula', cellName: 'Vida' },
  { id: 'lider-marilu', name: 'Marilu Araguna', role: 'Líder de Célula', cellName: 'Sion' },
  { id: 'lider-matias', name: 'Matias Arellano', role: 'Líder de Célula', cellName: 'Maranatha' },
  { id: 'lider-yamila', name: 'Yamila Llaver', role: 'Líder de Célula', cellName: 'Nissi' },
  { id: 'lider-godoy', name: 'Daniel H. Godoy', role: 'Líder de Grupo de Vida', cellName: 'Saetas' },
  { id: 'lider-elena-v', name: 'Elena Villegas', role: 'Pastora / Cobertura', cellName: 'Red CMV' },
  { id: 'lider-andres-c', name: 'Andrés Castro', role: 'Pastor / Cobertura', cellName: 'Red CMV' },
  { id: 'lider-carlos', name: 'Carlos Alberto', role: 'Pastor / Líder de Célula', cellName: 'Vida' },
  { id: 'lider-ana-marta', name: 'Ana Marta Rodriguez', role: 'Líder de Grupo de Vida', cellName: 'Saetas' },
  { id: 'lider-bacaloni', name: 'Emanuel Bacaloni', role: 'Líder de Grupo de Vida', cellName: 'Saetas' },
  { id: 'lider-guadalupe', name: 'López Guadalupe', role: 'Líder de Grupo de Vida', cellName: 'Saetas' },
  { id: 'lider-quiroga', name: 'Lucas Quiroga', role: 'Líder de Célula', cellName: 'Alfa y Omega' },
  { id: 'lider-sofia', name: 'Sofía Romero', role: 'Líder de Grupo de Vida', cellName: 'Maranatha' },
  { id: 'lider-javier-m', name: 'Javier Mendoza', role: 'Líder de Grupo de Vida', cellName: 'Alfa y Omega' },
];

// Apóstoles a cargo de la Célula Red Apostólica
export const APOSTOLIC_LEADERS_IN_CHARGE: {
  id: string;
  name: string;
  role: string;
  title: string;
  fotoUrl?: string;
}[] = [
  {
    id: 'apostol-jose-hernandez',
    name: 'Apóstol José Hernández',
    role: 'Apóstol Principal',
    title: 'Apóstol a Cargo',
  },
  {
    id: 'apostol-gabriela-castro',
    name: 'Apóstol Gabriela Castro',
    role: 'Apóstol',
    title: 'Apóstol a Cargo',
  },
];

interface RedApostolicaSectionProps {
  daughterCells: CellGroupView[];
  onSelectLeader?: (leader: { id: string; name: string; fotoUrl?: string; role?: string }, cellName?: string) => void;
  onSelectCell?: (cell: CellGroupView) => void;
}

export const RedApostolicaSection: React.FC<RedApostolicaSectionProps> = ({
  daughterCells,
  onSelectLeader,
  onSelectCell,
}) => {
  const navigate = useNavigate();
  // Los 15 líderes están ocultos/colapsados por defecto y se despliegan con el botón "VER"
  const [isLeadersOpen, setIsLeadersOpen] = useState(false);

  const handleLeaderClick = (leader: { id: string; name: string; fotoUrl?: string; role?: string }, cellName: string = 'Red Apostólica') => {
    if (onSelectLeader) {
      onSelectLeader(leader, cellName);
    } else {
      navigate(`/hermanos/${leader.id}`);
    }
  };

  return (
    <div
      id="red-apostolica-section"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#031522] via-[#062030] to-[#041a27] text-white border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:-translate-y-1 transition-all duration-500"
    >
      {/* 1. Degradé envolvente y resplandores en la parte de atrás para relieve 3D */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00dfa2]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 2. Franja superior con distintivo en Turquesa & Cian */}
      <div className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-transparent border-b border-cyan-400/25 flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <Crown size={18} className="text-cyan-300 animate-pulse" />
          <span>Célula Red Apostólica CMV • Formación de Líderes</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 md:p-9 space-y-7">
        {/* Cabecera principal: Logo Compacto + Célula principal + Apóstoles a cargo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Logo de la Red Apostólica compacto */}
              <div className="relative shrink-0 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-[#072437] to-[#041a27] border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
                <RedApostolicaLogo size={44} />
              </div>

              <div>
                {/* Badge: Célula principal */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 text-xs font-black uppercase tracking-widest mb-1">
                  <Sparkles size={12} className="text-[#00dfa2]" />
                  <span>Célula principal</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                  Red Apostólica
                </h2>
              </div>
            </div>

            {/* Apóstoles a cargo con fotos grandes y prominentes */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300/90 shrink-0">
                Apóstoles a Cargo:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {APOSTOLIC_LEADERS_IN_CHARGE.map((apostle) => (
                  <div
                    key={apostle.id}
                    onClick={() => handleLeaderClick(apostle, 'Red Apostólica')}
                    title={`Ver perfil de ${apostle.name}`}
                    className="group flex items-center gap-3.5 p-2 sm:p-2.5 pr-4 sm:pr-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-[#072437] hover:from-cyan-900 hover:to-[#09314a] border border-cyan-400/50 hover:border-[#00dfa2] text-white cursor-pointer transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 hover:scale-105 active:scale-95"
                  >
                    <img
                      src={getAvatarForBrother(apostle.name, apostle.fotoUrl)}
                      alt={apostle.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-400/70 group-hover:border-[#00dfa2] shadow-md shadow-cyan-500/30 shrink-0"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-sm sm:text-base font-black text-white group-hover:text-cyan-200 leading-tight">
                        {apostle.name}
                      </span>
                      <div className="mt-1">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[#00dfa2] border border-emerald-400/30">
                          {apostle.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botón interactivo para desplegar los 15 líderes en formación con el triangulito VER */}
          <button
            type="button"
            onClick={() => setIsLeadersOpen((prev) => !prev)}
            aria-expanded={isLeadersOpen}
            className="w-full lg:w-auto flex items-center justify-between gap-4 shrink-0 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-400/40 hover:border-cyan-300 rounded-3xl p-4 sm:px-6 sm:py-3.5 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            title={isLeadersOpen ? 'Ocultar los 15 líderes en formación' : 'Desplegar los 15 líderes en formación'}
          >
            <div className="flex flex-col text-left">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-cyan-200/90 leading-tight">
                Líderes en Formación
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00dfa2] leading-none mt-0.5">
                15 líderes
              </span>
            </div>

            {/* Pequeño botón interno con el triangulito hacia abajo que dice VER */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-500/20 group-hover:bg-[#00dfa2]/25 border border-cyan-400/50 text-[#00dfa2] text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0">
              <span>{isLeadersOpen ? 'Ocultar' : 'VER'}</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-300 text-[#00dfa2] ${
                  isLeadersOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Sección desplegable de los 15 líderes en formación: se ocultan dentro de 15 líderes y se despliegan con el botón VER */}
        {isLeadersOpen && (
          <div className="pt-5 border-t border-cyan-500/20 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
                <Users size={16} className="text-[#00dfa2]" />
                <span>15 Líderes en Formación (A cargo de los Apóstoles)</span>
              </div>
              <span className="text-xs sm:text-sm text-cyan-200/80 font-semibold">
                Líderes que a su vez pastorean discípulos en sus respectivas células
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CANONICAL_15_LEADERS.map((leader) => (
                <div
                  key={leader.id}
                  onClick={() => handleLeaderClick(leader, leader.cellName)}
                  title={`Ver detalles de ${leader.name} (${leader.cellName})`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/30 hover:border-cyan-300 text-white cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getAvatarForBrother(leader.name, leader.fotoUrl)}
                      alt={leader.name}
                      className="w-8 h-8 rounded-full object-cover border border-cyan-400/60 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold truncate text-white group-hover:text-cyan-300 transition-colors">
                        {leader.name}
                      </p>
                      <p className="text-[11px] text-cyan-200/70 font-semibold truncate">
                        {leader.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/20 text-[#00dfa2] border border-cyan-400/30 shrink-0 ml-2">
                    {leader.cellName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Células de la Red CMV y sus Grupos de Vida: Botones en forma de pastilla larga alineados uno debajo de otro */}
        <div className="p-5 sm:p-6 rounded-3xl bg-cyan-950/40 border border-cyan-400/30 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-cyan-100">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black uppercase tracking-wider">
              <GitBranch size={18} className="text-[#00dfa2]" />
              <span>Células de la Red CMV y sus Grupos de Vida:</span>
            </div>
            <span className="text-[11px] sm:text-xs text-cyan-200/70 font-semibold">
              Toca una célula para abrir su información, grupos y discípulos
            </span>
          </div>

          {/* Pastillas largas alineadas una debajo de otra semejantes a los módulos del panel izquierdo */}
          <div className="flex flex-col gap-3">
            {daughterCells.map((cell) => {
              const brand = getCellBranding(cell.nombre);
              const gruposVida = getGruposVidaForCell(cell);
              const totalGrupos = gruposVida.length;

              return (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => onSelectCell?.(cell)}
                  title={`Abrir información, grupos de vida y discípulos de ${brand.displayName}`}
                  className="w-full flex items-center justify-between gap-4 p-3 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-cyan-950/80 via-[#052338]/85 to-cyan-950/75 hover:from-cyan-900/90 hover:via-teal-900/75 hover:to-cyan-900/90 border border-cyan-400/40 hover:border-cyan-300 text-white shadow-md hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group text-left"
                >
                  {/* Lado izquierdo: Logo con relieve destacado + Nombre y detalles de la célula */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="p-1 sm:p-1.5 rounded-2xl bg-cyan-950/90 border border-cyan-400/50 shadow-md group-hover:border-cyan-300 group-hover:scale-105 transition-all shrink-0">
                      <CellLogoBadge cellName={cell.nombre} size="md" showGlow={true} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          {brand.displayName}
                        </span>
                        <span className="text-xs text-cyan-300 font-extrabold hidden md:inline">
                          • {brand.biblicalRef}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-200/80 font-medium truncate">
                        {totalGrupos} {totalGrupos === 1 ? 'Grupo de Vida' : 'Grupos de Vida'} activos • {brand.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Lado derecho: Cantidad de miembros + Flecha interactiva */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/20 group-hover:bg-[#00dfa2]/20 border border-cyan-400/40 group-hover:border-[#00dfa2]/50 text-cyan-200 group-hover:text-[#00dfa2] text-xs sm:text-sm font-black transition-all">
                      <Users size={14} className="text-[#00dfa2]" />
                      <span>{cell.totalMembers}</span>
                      <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">
                        {cell.totalMembers === 1 ? 'discípulo' : 'discípulos'}
                      </span>
                    </span>

                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:text-black group-hover:bg-[#00dfa2] group-hover:border-[#00dfa2] group-hover:translate-x-0.5 transition-all shadow-sm">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alias compatible
export const RedApostolicaMotherSection = RedApostolicaSection;
