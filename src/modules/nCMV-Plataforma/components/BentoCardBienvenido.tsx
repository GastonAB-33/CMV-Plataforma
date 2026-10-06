import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight, Home } from 'lucide-react';

interface BentoCardBienvenidoProps {
  onOpenEvents?: () => void;
}

export const BentoCardBienvenido: React.FC<BentoCardBienvenidoProps> = ({ onOpenEvents }) => {
  const navigate = useNavigate();

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-cyan-500/25 dark:border-cyan-400/25 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[360px] sm:min-h-[380px] bg-slate-950">
      {/* 1. Fotografía de fondo de alabanza con encuadre óptimo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/cmv-bienvenido-casa.jpg"
          alt="Bienvenido a tu comunidad CMV"
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
          <span>Uso Pastoral Exclusivo</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[9.5px] font-black uppercase tracking-wider">
          <Home size={11} className="text-emerald-400" />
          <span>Vida de Células</span>
        </div>
      </div>

      {/* 3. Contenido tipográfico y acción pastoral */}
      <div className="relative z-10 p-5 sm:p-6 mt-auto space-y-3">
        <div>
          <span className="inline-block text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyan-300 drop-shadow-sm">
            Comunidad CMV
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-[1.05] mt-1 drop-shadow-md">
            ¡Bienvenido a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00dfa2] to-[#38bdf8]">
              tu comunidad!
            </span>
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed drop-shadow-sm">
          Conoce la actividad actual de la congregación.
        </p>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEvents ? onOpenEvents : () => navigate('/events')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00dfa2] to-[#0ea5e9] hover:from-[#05b383] hover:to-[#0284c7] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Novedades Células</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/celulas')}
            title="Ver Red de Células"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
