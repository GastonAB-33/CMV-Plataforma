import React, { useEffect } from 'react';
import {
  X,
  Users,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Home,
  MapPin,
} from 'lucide-react';
import { CellGrupoVida } from '../services/cellGruposVidaService';
import { CellLogoBadge, getCellBranding } from '../cellBranding';
import { getAvatarForBrother } from '../../../services/avatarService';
import { STAGE_COLORS } from '../../../theme/stages';

interface GrupoVidaMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: CellGrupoVida | null;
  onNavigateBrother: (id: string) => void;
}

export const GrupoVidaMembersModal: React.FC<GrupoVidaMembersModalProps> = ({
  isOpen,
  onClose,
  grupo,
  onNavigateBrother,
}) => {
  // Manejo de la tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !grupo) return null;

  const brand = getCellBranding(grupo.cellName);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="grupovida-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#031522] via-[#062030] to-[#041a27] text-white border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/25 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Auras y halos de iluminación trasera para relieve 3D */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00dfa2]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Barra superior con distintivo de célula y botón de cerrar */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-cyan-400/20 pb-4">
          <div className="flex items-center gap-2.5">
            <CellLogoBadge cellName={grupo.cellName} size="sm" showGlow={false} />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 text-xs font-black uppercase tracking-wider">
              <Home size={13} className="text-[#00dfa2]" />
              <span>Célula {brand.displayName} • Grupo de Vida</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="w-10 h-10 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Título y detalles del Grupo de Vida */}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3
              id="grupovida-modal-title"
              className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
            >
              {grupo.nombre}
            </h3>
            <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[#00dfa2] text-xs sm:text-sm font-black shrink-0">
              {grupo.totalMembers} {grupo.totalMembers === 1 ? 'hermano integrante' : 'hermanos integrantes'}
            </span>
          </div>

          {/* Tarjeta de Líder y Horario de Reunión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center gap-3">
              <img
                src={getAvatarForBrother(grupo.lider.name, grupo.lider.fotoUrl)}
                alt={grupo.lider.name}
                className="w-11 h-11 rounded-2xl object-cover border border-cyan-400/50 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                  Líder a Cargo
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {grupo.lider.name}
                </p>
                <span className="text-[11px] text-cyan-200/80 font-medium">
                  {grupo.lider.role || 'Líder de Grupo'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-[#00dfa2] flex items-center justify-center shrink-0">
                <Calendar size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                  Reunión & Anfitrión
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {grupo.anfitrion || 'Reunión en Hogar'}
                </p>
                <span className="text-[11px] text-cyan-200/80 font-medium flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-400" />
                  {grupo.horario || 'Día y horario a coordinar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Hermanos que Pertenecen a este Grupo de Vida */}
        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 px-1">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#00dfa2]" />
              <span>Hermanos Integrantes ({grupo.members.length})</span>
            </div>
            <span className="text-xs text-slate-300 font-semibold lowercase">
              haz clic para ver ficha
            </span>
          </div>

          {grupo.members.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white/5 border border-cyan-400/20 p-6 space-y-2">
              <Users size={36} className="mx-auto text-cyan-400/50" />
              <p className="text-base font-bold text-white">
                No hay hermanos registrados en este grupo de vida
              </p>
              <p className="text-xs text-slate-300">
                Los hermanos asignados a esta célula se sumarán en las próximas reuniones de hogar.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {grupo.members.map((member) => {
                const stageClass =
                  STAGE_COLORS[member.procesoActual] ||
                  'bg-slate-800 text-slate-200 border-slate-700';

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      onClose();
                      onNavigateBrother(member.id);
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-cyan-950/70 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all duration-200 group shadow-sm hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={getAvatarForBrother(member.name, member.fotoUrl)}
                        alt={member.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0 border border-cyan-400/40 shadow-xs"
                      />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-300 font-medium">
                          {member.acompananteName ? `Acompañante: ${member.acompananteName}` : 'En seguimiento pastoral'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${stageClass}`}
                      >
                        {member.procesoActual}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón de cierre inferior */}
        <div className="relative z-10 pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
