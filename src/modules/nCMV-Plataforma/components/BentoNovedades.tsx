import React, { useState } from 'react';
import { Camera, Calendar, Users, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { GroupActivityNews } from '../types';

interface BentoNovedadesProps {
  onOpenEvents?: () => void;
}

const SAMPLE_ACTIVITIES: GroupActivityNews[] = [
  {
    id: 'act-1',
    groupName: 'Familias & Jóvenes CMV',
    category: 'Grupo de Vida',
    title: 'Encuentro de Comunión y Grupos de Vida',
    description: 'Tiempo especial de visión, café y comunión fraterna compartiendo testimonios en un ambiente cercano y familiar.',
    date: 'Reciente',
    photoUrl: '/cmv-novedades.jpg',
    attendeesCount: 34,
    featured: true,
  },
  {
    id: 'act-2',
    groupName: 'Célula de Vida Nissi',
    category: 'Célula',
    title: 'Noche de testimonios, café y oración',
    description: 'Compartiendo testimonios de fe y orando por las familias. Nuevos hermanos integrados al discipulado.',
    date: 'Jueves',
    photoUrl: '/cmv-fellowship.jpg',
    attendeesCount: 18,
    featured: false,
  },
  {
    id: 'act-3',
    groupName: 'Reunión General',
    category: 'General',
    title: 'Celebración dominical y bienvenida a visitas',
    description: 'Tiempo precioso de alabanza y recepción cálida para todas las nuevas familias que se acercan.',
    date: 'Domingo',
    photoUrl: '/banner-hermanos.jpg',
    attendeesCount: 95,
    featured: false,
  },
];

export const BentoNovedades: React.FC<BentoNovedadesProps> = ({ onOpenEvents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = SAMPLE_ACTIVITIES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SAMPLE_ACTIVITIES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SAMPLE_ACTIVITIES.length) % SAMPLE_ACTIVITIES.length);
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200/90 dark:border-white/10 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 col-span-1 md:col-span-2 lg:col-span-2">
      {/* Etiqueta superior y navegación compacta */}
      <div className="flex items-center justify-between z-10 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 text-[10.5px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>Actividades de Grupos</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-gray-400">
            <Users size={12} />
            <span>{current.groupName}</span>
          </span>
        </div>

        {/* Controles numéricos y flechas */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 mr-1.5">
            {currentIndex + 1} / {SAMPLE_ACTIVITIES.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors"
            aria-label="Anterior actividad"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors"
            aria-label="Siguiente actividad"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Contenedor de la foto con proporción estilizada */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[16/7.5] rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 group-hover:shadow-md transition-all">
        <img
          src={current.photoUrl}
          alt={current.title}
          className="w-full h-full object-cover object-[center_35%] filter brightness-[0.98] group-hover:scale-[1.02] transition-transform duration-700"
        />

        {/* Gradiente inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

        {/* Información superpuesta */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-[9.5px] font-black uppercase tracking-wider backdrop-blur-sm">
              <Camera size={10} />
              <span>{current.category}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white drop-shadow-md line-clamp-1">
              {current.title}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200 drop-shadow">
            <Calendar size={12} />
            <span>{current.date}</span>
          </div>
        </div>
      </div>

      {/* Rótulo inferior destacado: NOVEDADES */}
      <div className="z-10 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Boletín Comunitario
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
            NOVEDADES
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 max-w-lg line-clamp-1">
            {current.description}
          </p>
        </div>

        {onOpenEvents && (
          <button
            type="button"
            onClick={onOpenEvents}
            className="self-start sm:self-end px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-400 text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm shrink-0"
          >
            Ver más
          </button>
        )}
      </div>
    </div>
  );
};
