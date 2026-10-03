import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, ListFilter } from 'lucide-react';

export const BentoCardGeneral: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/hermanos')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 text-white p-4 sm:p-5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[175px]"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* Etiqueta superior */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest">
          <ListFilter size={11} className="text-amber-300" />
          <span>Padrón General</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-emerald-700 transition-all shadow-2xs">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Título GENERAL destacado */}
      <div className="z-10 my-auto py-1">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm leading-none">
          GENERAL
        </h2>
        <p className="text-xs text-emerald-100 font-medium mt-1 leading-snug line-clamp-2">
          Lista generalizada de todos los hermanos con todas las células.
        </p>
      </div>

      {/* Pie con indicador de acción */}
      <div className="z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-emerald-100">
        <span className="flex items-center gap-1.5">
          <Users size={12} />
          <span>Nombres & Células</span>
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold group-hover:underline">
          Abrir Lista →
        </span>
      </div>
    </div>
  );
};
