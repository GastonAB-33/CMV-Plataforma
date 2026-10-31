import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const BentoCardGeneral: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/hermanos')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] h-full w-full max-w-full min-w-0"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* Extremo superior con pastilla VISIÓN CMV y botón de acceso */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-[10.5px] font-black uppercase tracking-widest shadow-xs">
          <Sparkles size={12} className="text-cyan-300" />
          <span>VISIÓN CMV</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-emerald-700 transition-all shadow-2xs">
          <ArrowRight size={15} />
        </div>
      </div>

      {/* Título LÍNEA DE VIDA destacado y nuevo subtítulo */}
      <div className="z-10 my-auto py-1">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm leading-none">
          LÍNEA DE VIDA
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1.5 leading-snug">
          Estado General de Línea de Vida del Creyente en la Comunidad.
        </p>
      </div>

      {/* Pie con indicador de acción: Abrir → */}
      <div className="z-10 pt-2 border-t border-white/20 flex items-center justify-end text-xs font-black text-emerald-100">
        <span className="uppercase tracking-wider group-hover:underline">
          Abrir →
        </span>
      </div>
    </div>
  );
};

export const BentoCardLineaDeVida = BentoCardGeneral;
export const BentoCardCongregacion = BentoCardGeneral;
export const BentoCardVisionCMV = BentoCardGeneral;
