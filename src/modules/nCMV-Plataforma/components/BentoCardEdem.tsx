import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, ShieldCheck } from 'lucide-react';

export const BentoCardEdem: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/escuela-edem')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/30 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px]"
    >
      {/* Degradé envolvente sutil en la parte de atrás */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/10 via-[#06b6d4]/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Etiqueta superior */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-widest shadow-2xs">
          <ShieldCheck size={12} className="text-[#00dfa2]" />
          <span>Liderazgo EDEM</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-[#00dfa2] group-hover:to-[#06b6d4] group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-1">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Título ESCUELA EDEM */}
      <div className="relative z-10 my-auto py-2">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#00dfa2] dark:text-emerald-400">
          Entrenamiento Ministerial
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-1">
          ESCUELA EDEM
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold mt-1.5 leading-snug line-clamp-2">
          Escuela de Entrenamiento Ministerial y desarrollo de líderes y pastores.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="relative z-10 pt-3 border-t border-cyan-500/20 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-cyan-200">
        <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-black">
          <Award size={14} className="text-cyan-500" />
          <span>Nivel Ministerial</span>
        </span>
        <span className="uppercase tracking-wider text-xs font-black text-cyan-600 dark:text-cyan-300 group-hover:text-emerald-400 group-hover:underline">
          Acceder →
        </span>
      </div>
    </div>
  );
};
