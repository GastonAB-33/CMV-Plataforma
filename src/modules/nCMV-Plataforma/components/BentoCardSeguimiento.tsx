import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, ArrowRight, GitCommit } from 'lucide-react';

export const BentoCardSeguimiento: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-[#061524] via-[#092235] to-[#042825] text-white p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[195px] h-full border border-cyan-500/25 dark:border-cyan-400/30 w-full max-w-full min-w-0"
    >
      {/* 1. Fondo de medición con gráficas luminosas sombreadas en verde y azul petróleo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/estadisticas-bg.jpg"
          alt="Medición y Estadísticas"
          className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.25] opacity-65 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
        />
        {/* Degradé envolvente oscuro en verde petróleo (#042825) y azul petróleo (#061524 / #092235) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061524]/85 via-[#092235]/65 to-[#042825]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#042825]/95 via-transparent to-[#061524]/80" />
      </div>

      {/* Resplandor radial de alta fidelidad */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00dfa2]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Etiqueta superior */}
      <div className="relative flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#051f2b]/85 backdrop-blur-md border border-cyan-400/40 text-cyan-200 text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
          <GitCommit size={11} className="text-[#00dfa2]" />
          <span>MEDICIÓN</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#051f2b]/85 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center text-cyan-300 group-hover:translate-x-0.5 group-hover:bg-gradient-to-r group-hover:from-[#00dfa2] group-hover:to-cyan-400 group-hover:text-slate-950 transition-all shadow-2xs">
          <ArrowRight size={15} />
        </div>
      </div>

      {/* Título ESTADÍSTICAS con logotipo de medición más grande y notorio al final */}
      <div className="relative z-10 my-auto py-2">
        <span className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[#00dfa2] block mb-1.5 drop-shadow-sm">
          Crecimiento
        </span>

        <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
            ESTADÍSTICAS
          </h2>

          {/* Logotipo / Emblema de gráfica notorio y de mayor tamaño al final de Estadísticas */}
          <div className="relative shrink-0 flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00dfa2] via-cyan-400 to-[#0284c7] p-[2px] shadow-xl shadow-cyan-500/35 group-hover:shadow-cyan-400/70 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
            <div className="w-full h-full rounded-[14px] bg-[#051824]/95 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00dfa2]/30 via-cyan-500/20 to-transparent pointer-events-none" />
              {/* Gráfica que sube con barras y flecha ascendente */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_10px_rgba(0,223,162,0.7)]"
              >
                {/* Barras ascendentes */}
                <rect x="2.5" y="13.5" width="3.2" height="7.5" rx="1" fill="#00dfa2" fillOpacity="0.5" />
                <rect x="8" y="9.5" width="3.2" height="11.5" rx="1" fill="#06b6d4" fillOpacity="0.7" />
                <rect x="13.5" y="5.5" width="3.2" height="15.5" rx="1" fill="#38bdf8" fillOpacity="0.9" />
                {/* Línea que sube con trazo definido */}
                <path
                  d="M2.5 15L8 9.5L13.5 13L21 3.5"
                  stroke="#ffffff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.5H21V8.5"
                  stroke="#ffffff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Punto luminoso en la cúspide */}
                <circle cx="21" cy="3.5" r="1.8" fill="#00dfa2" />
              </svg>
            </div>
          </div>
        </div>

        <p className="text-[12px] sm:text-xs text-slate-200/90 font-medium mt-2 leading-relaxed line-clamp-3 drop-shadow-sm">
          Análisis métricas sobre altares, grupos de vida, células, escuelas y cada discípulo en tiempo real de forma mensual y anual.
        </p>
      </div>

      {/* Pie con detalles - solo el icono de la gráfica y enlace */}
      <div className="relative z-10 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] font-bold text-slate-300">
        <span className="flex items-center text-cyan-300 p-1 rounded-lg bg-white/5 border border-white/10">
          <LineChart size={14} className="text-[#00dfa2]" />
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold text-cyan-300 group-hover:text-[#00dfa2] group-hover:underline transition-colors">
          Ver Avance →
        </span>
      </div>
    </div>
  );
};
