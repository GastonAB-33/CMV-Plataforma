import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';

export const BentoCardAltares: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking?seccion=altares')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-[#07131f] dark:bg-[#07131f] border border-amber-500/30 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] h-full w-full max-w-full min-w-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-[#00dfa2]/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Etiqueta superior: solo la llamita y botón de acceso */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-[#241308]/80 border border-amber-600/40 text-amber-400 shadow-2xs">
          <Flame size={17} className="text-amber-400" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#241308]/80 border border-amber-600/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-0.5">
          <ArrowRight size={18} />
        </div>
      </div>

      {/* Título ALTARES y categoría CELULA DE CONEXION Y ALCANCE */}
      <div className="z-10 my-auto py-2">
        <span className="text-xs sm:text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-1">
          CELULA DE CONEXION Y ALCANCE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none mt-0.5">
          ALTARES
        </h2>
        <p className="text-sm text-slate-300 dark:text-slate-300 font-medium mt-2 leading-relaxed">
          Seguimiento general, funcionamiento y desarrollo.
        </p>
      </div>

      {/* Pie con detalles: solo INGRESAR → a la derecha */}
      <div className="z-10 pt-3 border-t border-white/10 flex items-center justify-end">
        <span className="uppercase tracking-wider text-xs sm:text-xs font-black text-amber-400 group-hover:underline">
          INGRESAR →
        </span>
      </div>
    </div>
  );
};

// Alias para compatibilidad
export const BentoCardEddi = BentoCardAltares;
