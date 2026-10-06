import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

export const BentoCardJesusDevocional: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl border border-cyan-500/25 dark:border-cyan-400/20 p-5 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[300px] bg-[#071622] text-white"
    >
      {/* 1. Fotografía de fondo nítida con silueta de oración y cruz de Jesús */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/cmv-jesus-devocional.jpg"
          alt="Altar Jesús Oración CMV"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Velo translúcido con gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071622] via-[#071622]/20 to-[#071622]/70" />
      </div>

      {/* 2. Insignia superior */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
          <Sparkles size={11} className="text-cyan-300" />
          <span>Altar de Oración</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all shadow-2xs group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* 3. Información devocional inferior */}
      <div className="relative z-10 pt-4 mt-auto">
        <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1 group-hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300">
              Intercesión Pastoral
            </span>
            <Heart size={12} className="text-rose-400 fill-rose-400/50" />
          </div>
          <p className="text-[11px] text-slate-200 font-medium leading-snug">
            Oración diaria y cobertura espiritual sobre cada familia y célula de CMV.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-extrabold text-cyan-300 group-hover:text-cyan-200">
            <span>Ver Seguimiento en Altar</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
};
