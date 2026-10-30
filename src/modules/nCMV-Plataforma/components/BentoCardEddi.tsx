import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';

export const BentoCardAltares: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking?seccion=altares#altares')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-amber-500/30 dark:border-amber-400/35 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-[#00dfa2]/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Etiqueta superior */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-2xs">
          <Flame size={13} className="text-amber-500" />
          <span>Red Apostólica</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-700 dark:text-amber-300 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-emerald-500 group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-1">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Título ALTARES */}
      <div className="z-10 my-auto py-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          Seguimiento Espiritual
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
          ALTARES
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 leading-snug line-clamp-2">
          Monitoreo general de altares en la congregación, mentores y fichas personales.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="z-10 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-gray-400">
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Flame size={13} />
          <span>Monitoreo de Altares</span>
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold text-amber-600 dark:text-amber-400 group-hover:underline">
          Ingresar →
        </span>
      </div>
    </div>
  );
};

// Alias para compatibilidad
export const BentoCardEddi = BentoCardAltares;
