import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

export const BentoCardEddi: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/escuela-eddi')}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/30 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[185px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 via-[#00dfa2]/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Etiqueta superior */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-widest shadow-2xs">
          <BookOpen size={12} className="text-cyan-500" />
          <span>Discipulado</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-[#00dfa2] group-hover:to-[#06b6d4] group-hover:text-slate-950 transition-all shadow-xs group-hover:translate-x-1">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Título ESCUELA EDDI */}
      <div className="z-10 my-auto py-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Formación Doctrinal
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
          ESCUELA EDDI
        </h2>
        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 leading-snug line-clamp-2">
          Cohortes de discipulado, materias bíblicas y calificaciones.
        </p>
      </div>

      {/* Pie con detalles */}
      <div className="z-10 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-gray-400">
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
          <GraduationCap size={13} />
          <span>Alumnos & Docentes</span>
        </span>
        <span className="uppercase tracking-wider text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline">
          Ingresar →
        </span>
      </div>
    </div>
  );
};
