import React from 'react';
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Users,
  Award,
  Library,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { escuelasService } from '../services/escuelasService';
import { SchoolType } from '../types';

interface EscuelasBentoMenuProps {
  onSelectSchool: (school: SchoolType) => void;
}

export const EscuelasBentoMenu: React.FC<EscuelasBentoMenuProps> = ({ onSelectSchool }) => {
  const globalStats = escuelasService.getGlobalStats();

  const eddi1Stats = escuelasService.getSchoolStats('eddi-1');
  const eddi2Stats = escuelasService.getSchoolStats('eddi-2');
  const eddi3Stats = escuelasService.getSchoolStats('eddi-3');
  const edemStats = escuelasService.getSchoolStats('edem');
  const materials = escuelasService.listStudyMaterials();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Banner Principal de Escuelas con Estilo Pastoral */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#06122d] via-[#0369a1] to-[#047857] p-6 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-2xl text-white">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.4)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-cyan-400/30 text-white text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="text-emerald-400" size={13} />
              <span>PLATAFORMA ACADÉMICA Y DISCIPULAR CMV</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Escuelas de Formación
            </h1>
            <p className="text-sm sm:text-base text-cyan-100 font-medium leading-relaxed">
              Sistema integral de capacitación doctrinal, seguimiento de cohortes y biblioteca de estudio ministerial, conectado en tiempo real con la Línea de Vida de cada hermano.
            </p>
          </div>

          {/* Métricas Globales en Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-200 block">
                Total Alumnos
              </span>
              <p className="text-2xl font-black text-white mt-0.5">{globalStats.totalEnrollments}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">
                En Cursada
              </span>
              <p className="text-2xl font-black text-emerald-300 mt-0.5">{globalStats.activeEnrollments}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-200 block">
                Materiales
              </span>
              <p className="text-2xl font-black text-amber-300 mt-0.5">{materials.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Bento Grid con los 5 Ítems al Estilo de la Referencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        
        {/* TARJETA 1: EDDI 1 */}
        <div
          onClick={() => onSelectSchool('eddi-1')}
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-emerald-500/80 dark:hover:border-emerald-500/60 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          {/* Luz sutil de fondo */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />

          {/* Cabecera de la Tarjeta */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                <BookOpen size={13} />
                <span>DISCIPULADO • NIVEL 1</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                <ArrowRight size={15} />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400 block mb-1">
              FORMACIÓN DOCTRINAL BÁSICA
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
              ESCUELA EDDI 1
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
              Fundamentos de la fe, primeros pasos del creyente, doctrina bíblica básica y vida devocional diaria.
            </p>
          </div>

          {/* Pie de Tarjeta */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-bold">
              <Users size={14} className="text-emerald-500" />
              <span>{eddi1Stats.totalStudents} Alumnos ({eddi1Stats.inProgressCount} activos)</span>
            </div>
            <span className="inline-flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              INGRESAR <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* TARJETA 2: EDDI 2 */}
        <div
          onClick={() => onSelectSchool('eddi-2')}
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-sky-500/80 dark:hover:border-sky-500/60 shadow-lg hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-[11px] font-black uppercase tracking-wider">
                <Flame size={13} />
                <span>CRECIMIENTO • NIVEL 2</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-300 group-hover:bg-sky-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                <ArrowRight size={15} />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400 block mb-1">
              FORMACIÓN DE CARÁCTER Y SERVICIO
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
              ESCUELA EDDI 2
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
              Carácter cristiano maduro, vida en el Espíritu Santo, mayordomía bíblica y evangelismo sobrenatural.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-bold">
              <Users size={14} className="text-sky-500" />
              <span>{eddi2Stats.totalStudents} Alumnos ({eddi2Stats.inProgressCount} activos)</span>
            </div>
            <span className="inline-flex items-center gap-1 font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              INGRESAR <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* TARJETA 3: EDDI 3 */}
        <div
          onClick={() => onSelectSchool('eddi-3')}
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-amber-500/80 dark:hover:border-amber-500/60 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-wider">
                <GraduationCap size={13} />
                <span>MULTIPLICACIÓN • NIVEL 3</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-300 group-hover:bg-amber-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                <ArrowRight size={15} />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 block mb-1">
              LIDERAZGO DISCIPULAR Y CÉLULAS
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
              ESCUELA EDDI 3
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
              Liderazgo celular práctico, plantación, formación de nuevos discípulos y guerra espiritual con autoridad.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-bold">
              <Users size={14} className="text-amber-500" />
              <span>{eddi3Stats.totalStudents} Alumnos ({eddi3Stats.inProgressCount} activos)</span>
            </div>
            <span className="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              INGRESAR <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* TARJETA 4: EDEM (Ancha en pantallas grandes o 2 columnas) */}
        <div
          onClick={() => onSelectSchool('edem')}
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-purple-500/80 dark:hover:border-purple-500/60 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 lg:col-span-2"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/30 transition-all" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-[11px] font-black uppercase tracking-wider">
                <Award size={13} />
                <span>MINISTERIAL • NIVEL SUPERIOR</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-300 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                <ArrowRight size={15} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400 block mb-1">
                  ENTRENAMIENTO MINISTERIAL AVANZADO
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                  ESCUELA EDEM
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-4">
                  Escuela de Entrenamiento Ministerial: formación pastoral, teología bíblica, homilética expositiva, consejería y activación de los 5 ministerios congregacionales.
                </p>
              </div>

              {/* Indicador destacado de graduación ministerial */}
              <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-center sm:text-left">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 size={14} /> Etapa 9
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                  Habilita el ingreso pleno a Líder Ministerial (Etapa 10).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs mt-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-bold">
              <Award size={14} className="text-purple-500" />
              <span>{edemStats.totalStudents} Ministros en formación ({edemStats.inProgressCount} activos)</span>
            </div>
            <span className="inline-flex items-center gap-1 font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              INGRESAR <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* TARJETA 5: MATERIAL DE ESTUDIO (1 Columna en desktop) */}
        <div
          onClick={() => onSelectSchool('material-estudio')}
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 hover:border-teal-500/80 dark:hover:border-teal-500/60 shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 lg:col-span-1"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/25 transition-all" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-[11px] font-black uppercase tracking-wider">
                <Library size={13} />
                <span>RECURSOS & DESCARGAS</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-gray-300 group-hover:bg-teal-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                <ArrowRight size={15} />
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400 block mb-1">
              BIBLIOTECA VIRTUAL Y DESCARGAS
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
              MATERIAL DE ESTUDIO
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
              Manuales oficiales en PDF, guías de estudio, lecciones bíblicas y bosquejos docentes para cada nivel.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-bold">
              <Library size={14} className="text-teal-500" />
              <span>{materials.length} Recursos disponibles</span>
            </div>
            <span className="inline-flex items-center gap-1 font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              EXPLORAR <ArrowRight size={13} />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
