import React, { useState } from 'react';
import { Play, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { CulturaCongregacionalModal } from './CulturaCongregacionalModal';

export const BentoCardCulture: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative group cursor-pointer overflow-hidden rounded-3xl bg-[#091a28] border border-cyan-500/25 dark:border-cyan-400/25 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-400/60 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[300px] text-white"
      >
        {/* Resplandor ambiental de fondo */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#00dfa2]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Encabezado informativo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles size={12} className="text-cyan-300" />
            <span>ADN & Doctrina CMV</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Cultura & Visión
          </span>
        </div>

        {/* Insignia Circular con Texto Curvo Rotativo y Botón de Inicio */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Texto circular SVG rotando suavemente */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite] group-hover:animate-[spin_10s_linear_infinite] transition-all pointer-events-none"
            >
              <defs>
                <path
                  id="circlePathCulture"
                  d="M 100, 100 m -68, 0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0"
                />
              </defs>
              <text className="text-[13px] font-black uppercase tracking-[0.22em] fill-cyan-300/90 dark:fill-cyan-200">
                <textPath href="#circlePathCulture" startOffset="0%">
                  CONOCE MÁS SOBRE NUESTRA CULTURA • ADN •
                </textPath>
              </text>
            </svg>

            {/* Botón central interactivo con icono intuitivo de play */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00dfa2] to-[#0284c7] p-0.5 shadow-xl group-hover:scale-110 group-hover:shadow-cyan-400/40 transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#051f2d] flex items-center justify-center text-cyan-300 group-hover:text-white transition-colors">
                <Play size={22} className="fill-cyan-400 group-hover:fill-white ml-0.5 transition-colors" />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-black uppercase tracking-wider text-white text-center mt-2">
            Identidad & Misión
          </h3>
          <p className="text-[11px] text-cyan-200/80 text-center font-medium">
            Pulsa para abrir guía de visión y ADN pastoral
          </p>
        </div>

        {/* Pie intuitivo de Cultura y Visión */}
        <div className="relative z-10 pt-3 border-t border-cyan-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Compass size={14} className="text-emerald-400" />
            <span>Principios, Fe y Visión</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-cyan-300 group-hover:text-cyan-200">
            <span>Ver Visión</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Modal interactivo de Cultura Congregacional */}
      <CulturaCongregacionalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
