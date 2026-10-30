import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const BentoCardLiderazgo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/escuelas')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-[#0c1422] border border-cyan-500/25 hover:border-cyan-400/60 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[360px] sm:min-h-[380px] h-full text-white"
    >
      {/* Resplandor superior e inferior */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#00dfa2]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Encabezado con insignia ESCUELAS */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-sm">
          <GraduationCap size={13} className="text-cyan-300" />
          <span>ESCUELAS</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all shadow-2xs group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Tipografía Geométrica Apilada ES-CUE-LAS idéntica a la referencia */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center select-none">
        {/* Barra horizontal superior cian */}
        <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full mb-3 group-hover:w-28 transition-all duration-500" />

        <div className="flex flex-col items-center font-black tracking-tight leading-[0.88] text-center">
          <span className="text-5xl sm:text-6xl font-black text-cyan-400 group-hover:text-cyan-300 transition-colors tracking-wider">
            ES
          </span>
          <span className="text-5xl sm:text-6xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors tracking-wider">
            CUE
          </span>
          <span className="text-5xl sm:text-6xl font-black text-teal-300 group-hover:text-teal-200 transition-colors tracking-wider">
            LAS
          </span>
        </div>

        {/* Barra horizontal inferior cian con corte sutil */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-10 h-1.5 bg-cyan-400 rounded-full" />
          <div className="w-3 h-1.5 bg-emerald-400 rounded-full" />
          <div className="w-12 h-1.5 bg-teal-400 rounded-full group-hover:w-16 transition-all duration-500" />
        </div>
      </div>

      {/* Pie con detalles de formación y enlace */}
      <div className="relative z-10 pt-3 border-t border-cyan-900/40 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <GraduationCap size={13} />
            <span>Módulo de Escuelas</span>
          </span>
          <span className="text-[10px] text-emerald-400 uppercase font-black">Activo</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
          Formación bíblica, discipulado EDDI y liderazgo EDEM.
        </p>
      </div>
    </div>
  );
};
