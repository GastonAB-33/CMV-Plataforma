import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, ShieldCheck } from 'lucide-react';

export const BentoCardEdem: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/escuela-edem')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200/90 dark:border-white/10 p-4 sm:p-5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[175px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Etiqueta superior */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[#0c1e38] dark:text-sky-200 text-[10px] font-extrabold uppercase tracking-widest">
          <ShieldCheck size={11} />
          <span>Liderazgo</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white group-hover:bg-amber-500 group-hover:text-white transition-all shadow-2xs group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Título ESCUELA EDEM */}
      <div className="z-10 my-auto py-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0c1e38] dark:text-sky-300 font-black">
          Entrenamiento
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
          ESCUELA EDEM
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 leading-snug line-clamp-2">
          Escuela de Entrenamiento Ministerial y desarrollo de líderes.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="z-10 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-gray-400">
        <span className="flex items-center gap-1 text-[#0c1e38] dark:text-sky-300 font-black">
          <Award size={13} />
          <span>Nivel Ministerial</span>
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold text-[#0c1e38] dark:text-sky-300 font-black group-hover:underline">
          Acceder →
        </span>
      </div>
    </div>
  );
};
