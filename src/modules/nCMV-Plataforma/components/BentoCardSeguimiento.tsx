import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, ArrowRight, GitCommit } from 'lucide-react';

export const BentoCardSeguimiento: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-[#061524] via-[#092235] to-[#042825] text-white p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] border border-cyan-500/25 dark:border-cyan-400/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/10 via-[#06b6d4]/5 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* Etiqueta superior */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-200 text-[10px] font-extrabold uppercase tracking-widest">
          <GitCommit size={11} className="text-cyan-400" />
          <span>Procesos</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-2xs">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Título SEGUIMIENTO */}
      <div className="z-10 my-auto py-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
          Crecimiento
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none mt-0.5">
          SEGUIMIENTO
        </h2>
        <p className="text-xs text-slate-300 font-medium mt-1 leading-snug line-clamp-2">
          Altar, Grupo, Experiencia, EDDI y Discípulo en tiempo real.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] font-bold text-slate-300">
        <span className="flex items-center gap-1.5 text-cyan-300">
          <LineChart size={12} />
          <span>Pipeline Pastoral</span>
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold text-cyan-300 group-hover:underline">
          Ver Avance →
        </span>
      </div>
    </div>
  );
};
