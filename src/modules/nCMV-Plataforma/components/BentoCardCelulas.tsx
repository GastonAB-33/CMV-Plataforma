import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

export const BentoCardGruposVida: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/tracking?seccion=grupos-vida')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-[#07131f] dark:bg-[#07131f] border border-cyan-500/25 dark:border-cyan-400/30 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px] h-full w-full max-w-full min-w-0"
    >
      {/* Degradé envolvente flotante en la parte de atrás */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/15 via-[#06b6d4]/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* Etiqueta superior: solo las personitas y botón flecha */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-[#05232d]/80 border border-cyan-500/40 text-cyan-300 shadow-2xs">
          <Users size={15} className="text-emerald-400" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#05232d]/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-0.5">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Título GRUPOS DE VIDA y categoría CELULA DE CONSOLIDACIÓN */}
      <div className="relative z-10 my-auto py-1.5">
        <span className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#00dfa2] dark:text-emerald-400 block mb-1">
          CELULA DE CONSOLIDACIÓN
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none mt-0.5">
          GRUPOS DE VIDA
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5 leading-snug">
          Seguimiento general, funcionamiento y desarrollo.
        </p>
      </div>

      {/* Pie con detalles: solo VER GRUPOS → a la derecha */}
      <div className="relative z-10 pt-2.5 border-t border-white/10 flex items-center justify-end">
        <span className="uppercase tracking-wider text-xs font-extrabold text-cyan-400 group-hover:underline">
          VER GRUPOS →
        </span>
      </div>
    </div>
  );
};

// Alias para compatibilidad con módulos existentes
export const BentoCardCelulas = BentoCardGruposVida;
