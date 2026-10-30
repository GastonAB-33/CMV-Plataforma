import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  VidaLeafLogo,
  SaetasArrowLogo,
  MaranathaStarLogo,
  SionMountainLogo,
} from '../../celulas/cellBranding';

export const BentoCardGruposVida: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking?seccion=grupos-vida#grupos-vida')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/30 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] h-full"
    >
      {/* Degradé envolvente flotante en la parte de atrás */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/15 via-[#06b6d4]/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* Etiqueta superior */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-widest shadow-2xs">
          <Users size={13} className="text-emerald-500" />
          <span>Grupos Abiertos</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-[#00dfa2] group-hover:to-[#06b6d4] group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-1">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Título GRUPOS DE VIDA y muestra de identidades */}
      <div className="relative z-10 my-auto py-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#00dfa2] dark:text-emerald-400">
              Contención Pastoral
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-1">
              GRUPOS DE VIDA
            </h2>
          </div>

          {/* Mini logos en el botón adaptados a la paleta esmeralda / turquesa / cian */}
          <div className="flex items-center -space-x-2.5 pl-2">
            <div
              className="w-9 h-9 rounded-full bg-white dark:bg-[#07131f] border-2 border-emerald-400/70 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform"
              title="Vida"
            >
              <VidaLeafLogo size={24} />
            </div>
            <div
              className="w-9 h-9 rounded-full bg-white dark:bg-[#07131f] border-2 border-cyan-400/70 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform"
              title="Saetas"
            >
              <SaetasArrowLogo size={24} />
            </div>
            <div
              className="w-9 h-9 rounded-full bg-white dark:bg-[#07131f] border-2 border-sky-400/70 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform"
              title="Maranatha"
            >
              <MaranathaStarLogo size={24} />
            </div>
            <div
              className="w-9 h-9 rounded-full bg-white dark:bg-[#07131f] border-2 border-teal-400/70 shadow-md flex items-center justify-center hidden sm:flex group-hover:scale-110 transition-transform"
              title="Sion"
            >
              <SionMountainLogo size={24} />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold mt-2 leading-snug line-clamp-2">
          Monitoreo de grupos abiertos, quién lo lidera y cantidad de hermanos menores contenidos.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="relative z-10 pt-3 border-t border-cyan-500/20 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-cyan-200">
        <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-black">
          <ShieldCheck size={14} className="text-cyan-500" />
          <span>Líderes & Contención</span>
        </span>
        <span className="uppercase tracking-wider text-xs font-black text-cyan-600 dark:text-cyan-300 group-hover:text-emerald-400 group-hover:underline">
          Ver Grupos →
        </span>
      </div>
    </div>
  );
};

// Alias para compatibilidad con módulos existentes
export const BentoCardCelulas = BentoCardGruposVida;
