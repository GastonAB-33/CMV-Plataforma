import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface BentoCardBienvenidoProps {
  onOpenEvents?: () => void;
}

export const BentoCardBienvenido: React.FC<BentoCardBienvenidoProps> = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/celulas')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl border border-cyan-500/25 dark:border-cyan-400/25 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[360px] sm:min-h-[380px] h-full bg-slate-950"
    >
      {/* 1. Fotografía de fondo de alabanza y comunidad con encuadre óptimo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/cmv-bienvenido-casa.jpg"
          alt="Células CMV"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Degradé envolvente superior e inferior para legibilidad extrema */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />
      </div>

      {/* 2. Insignias superiores de uso pastoral exclusivo */}
      <div className="relative z-10 p-5 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
          <ShieldCheck size={13} className="text-cyan-400" />
          <span>Red de Células</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-[#00dfa2] group-hover:to-[#38bdf8] group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-0.5">
          <ArrowRight size={15} />
        </div>
      </div>

      {/* 3. Contenido tipográfico y botón CÉLULAS */}
      <div className="relative z-10 p-5 sm:p-6 mt-auto space-y-3">
        <div>
          <span className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-[#00dfa2] drop-shadow-sm">
            Red Congregacional
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none mt-1 drop-shadow-md">
            CÉLULAS
          </h2>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/celulas');
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00dfa2] to-[#0ea5e9] hover:from-[#05b383] hover:to-[#0284c7] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>CÉLULAS</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const BentoCardCelulasButton = BentoCardBienvenido;
export const BentoCardCelulasMain = BentoCardBienvenido;
