import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import {
  VidaLeafLogo,
  SaetasArrowLogo,
  MaranathaStarLogo,
  SionMountainLogo,
  AlfaOmegaLogo,
  NissiBannerLogo,
} from '../../celulas/cellBranding';

interface BentoCardBienvenidoProps {
  onOpenEvents?: () => void;
}

const CELL_LOGOS_PREVIEW = [
  { key: 'vida', name: 'Vida', Icon: VidaLeafLogo },
  { key: 'saetas', name: 'Saetas', Icon: SaetasArrowLogo },
  { key: 'maranatha', name: 'Maranatha', Icon: MaranathaStarLogo },
  { key: 'sion', name: 'Sion', Icon: SionMountainLogo },
  { key: 'alfa-omega', name: 'Alfa y Omega', Icon: AlfaOmegaLogo },
  { key: 'nissi', name: 'Nissi', Icon: NissiBannerLogo },
];

export const BentoCardBienvenido: React.FC<BentoCardBienvenidoProps> = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/celulas')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl border border-cyan-500/25 dark:border-cyan-400/25 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[340px] sm:min-h-[380px] h-full bg-slate-950 w-full max-w-full min-w-0"
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

      {/* 2. Insignias superiores: Red de Células CMV + Logos de Células superpuestos */}
      <div className="relative z-10 p-5 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">
          <ShieldCheck size={13} className="text-[#00dfa2]" />
          <span>RED DE CÉLULAS CMV</span>
        </div>

        {/* Logos circulares de las diferentes células sutilmente superpuestos (en reemplazo de la flecha) */}
        <div
          title="Células de la Red CMV"
          className="flex items-center -space-x-1.5 sm:-space-x-2 bg-black/60 backdrop-blur-md p-1 px-1.5 rounded-full border border-cyan-400/40 shadow-md group-hover:border-[#00dfa2]/60 transition-colors shrink-0"
        >
          {CELL_LOGOS_PREVIEW.map((cell) => (
            <div
              key={cell.key}
              title={cell.name}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#071d2b]/95 border border-cyan-400/50 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden"
            >
              <cell.Icon size={14} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Contenido tipográfico y botón VER exacto a la referencia */}
      <div className="relative z-10 p-5 sm:p-6 mt-auto space-y-3">
        <div className="pl-3 sm:pl-4 space-y-1">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#00dfa2] block">
            CÉLULA DE DISCIPULADO
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
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
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#00dfa2] via-[#00c9bf] to-[#00b4d8] hover:brightness-105 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>VER</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const BentoCardCelulasButton = BentoCardBienvenido;
export const BentoCardCelulasMain = BentoCardBienvenido;
