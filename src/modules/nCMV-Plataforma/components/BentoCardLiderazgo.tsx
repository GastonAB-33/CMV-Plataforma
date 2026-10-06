import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';

export const BentoCardLiderazgo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/escuela-edem')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-[#0c1422] border border-cyan-500/20 hover:border-cyan-400/50 p-5 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[360px] sm:min-h-[380px] text-white"
    >
      {/* Resplandor superior e inferior */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Encabezado con insignia pastoral */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
          <Award size={11} className="text-amber-300" />
          <span>EDEM • Mentoría</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all shadow-2xs group-hover:translate-x-0.5">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Tipografía Geométrica Apilada LI-DER-AZGO idéntica al diseño de referencia RE-FU-GIO */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center select-none">
        {/* Barra horizontal superior cian */}
        <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full mb-2 group-hover:w-28 transition-all duration-500" />

        <div className="flex flex-col items-center font-black tracking-tight leading-[0.88] text-center">
          <span className="text-5xl sm:text-6xl font-black text-cyan-400 group-hover:text-cyan-300 transition-colors">
            LI
          </span>
          <span className="text-5xl sm:text-6xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
            DER
          </span>
          <span className="text-5xl sm:text-6xl font-black text-cyan-400 group-hover:text-cyan-300 transition-colors">
            AZGO
          </span>
        </div>

        {/* Barra horizontal inferior cian con corte sutil */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="w-10 h-1.5 bg-cyan-400 rounded-full" />
          <div className="w-3 h-1.5 bg-emerald-400 rounded-full" />
          <div className="w-12 h-1.5 bg-teal-400 rounded-full group-hover:w-16 transition-all duration-500" />
        </div>
      </div>

      {/* Pie con detalles de formación y enlace */}
      <div className="relative z-10 pt-3 border-t border-cyan-900/40 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck size={13} />
            <span>Formación Ministerial</span>
          </span>
          <span className="text-[10px] text-emerald-400 uppercase font-black">Activo</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
          Desarrollo continuo de líderes de célula y futuros pastores.
        </p>
      </div>
    </div>
  );
};
