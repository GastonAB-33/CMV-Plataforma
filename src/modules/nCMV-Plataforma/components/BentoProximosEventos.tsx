import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video,
  Camera,
  Clock,
  ArrowRight,
  Layers,
  Flame,
} from 'lucide-react';
import { eventsService, PublicationItem } from '../../../services/eventsService';

interface BentoProximosEventosProps {
  onOpenEvents?: () => void;
}

export const BentoProximosEventos: React.FC<BentoProximosEventosProps> = ({ onOpenEvents }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PublicationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Carga de eventos desde eventsService y suscripción reactiva a cambios
  useEffect(() => {
    const loadEvents = () => {
      const upcoming = eventsService.listUpcomingEvents();
      setEvents(upcoming);
    };

    loadEvents();

    // Escucha eventos de actualización del módulo de eventos y cambios de almacenamiento
    window.addEventListener('cmv_events_updated', loadEvents);
    window.addEventListener('storage', loadEvents);

    return () => {
      window.removeEventListener('cmv_events_updated', loadEvents);
      window.removeEventListener('storage', loadEvents);
    };
  }, []);

  // Transición automática cada 3 segundos
  useEffect(() => {
    if (isPaused || events.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, events.length, currentIndex]);

  // Si cambia el slide y es video, reiniciar reproducción en bucle corto de 7 segundos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const handlePrev = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNavigateToEvents = () => {
    if (onOpenEvents) {
      onOpenEvents();
    } else {
      navigate('/events');
    }
  };

  const current = events[currentIndex] || {
    id: 'placeholder',
    title: 'Noche de Avivamiento & Adoración',
    text: 'Tiempo especial de alabanza, palabra y milagros con toda la congregación de CMV.',
    date: '2026-11-15',
    time: '19:30',
    badge: 'Celebración General',
    image: '/cmv-fellowship.jpg',
    video: '/cmv-event-short.mp4',
    mediaType: 'video' as const,
  };

  const formatDateDisplay = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'Próximamente';
    const parsed = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    const formatted = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
    }).format(parsed);
    return timeStr ? `${formatted} • ${timeStr} hs` : formatted;
  };

  const isVideo = current.mediaType === 'video' || Boolean(current.video);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/25 dark:border-cyan-400/20 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 transition-all duration-500 flex flex-col justify-between p-4 sm:p-5 col-span-1 md:col-span-2 lg:col-span-2 min-h-[360px]"
    >
      {/* Resplandor sutil de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/10 via-[#06b6d4]/5 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* 1. Encabezado superior con etiqueta dinámica y controles manuales */}
      <div className="flex items-center justify-between z-10 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Calendar size={13} className="text-[#00dfa2]" />
            <span>AGENDA CONGREGACIONAL</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-gray-400">
            <Flame size={12} className="text-amber-500" />
            <span>{current.badge || 'Agenda CMV'}</span>
          </span>
        </div>

        {/* Indicadores interactivos, contador y flechas de navegación manual */}
        <div className="flex items-center gap-2">
          {/* Píldoras de progreso interactivo de 3 segundos */}
          <div className="flex items-center gap-1 mr-1">
            {events.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                aria-label={`Ir al evento ${idx + 1}`}
                className={`relative h-1.5 rounded-full transition-all duration-300 overflow-hidden ${
                  idx === currentIndex
                    ? 'w-6 bg-cyan-500 dark:bg-cyan-400'
                    : 'w-2 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/40'
                }`}
              >
                {/* Animación de barra de progreso que se llena en 3 segundos */}
                {idx === currentIndex && !isPaused && (
                  <span className="absolute inset-0 bg-emerald-400 animate-[progress_3s_linear]" />
                )}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500">
            {events.length > 0 ? `${currentIndex + 1} / ${events.length}` : '1 / 1'}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Anterior evento"
              title="Anterior (Manual)"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Siguiente evento"
              title="Siguiente (Manual)"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Contenedor de Medios: Fotografías y Videos cortos (7s) */}
      <div className="relative w-full aspect-[16/8] sm:aspect-[16/7.5] rounded-2xl overflow-hidden shadow-inner bg-slate-900 group-hover:shadow-md transition-all">
        {isVideo && current.video ? (
          <video
            ref={videoRef}
            key={current.id + '-video'}
            src={current.video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center filter brightness-[0.98] group-hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <img
            key={current.id + '-img'}
            src={current.image || '/cmv-novedades.jpg'}
            alt={current.title}
            className="w-full h-full object-cover object-[center_35%] filter brightness-[0.98] group-hover:scale-[1.02] transition-transform duration-700"
          />
        )}

        {/* Gradiente oscuro inferior para legibilidad cinematográfica */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

        {/* Badges superiores flotantes sobre el medio */}
        <div className="absolute top-2.5 right-3.5 flex items-center justify-end z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Layers size={10} />
            <span>{current.badge || 'CMV Oficial'}</span>
          </div>
        </div>

        {/* Información superpuesta en el borde inferior de la foto/video */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between text-white z-10">
          <div className="space-y-0.5 max-w-[75%]">
            <p className="text-xs sm:text-base font-black text-white drop-shadow-md leading-snug line-clamp-1">
              {current.title}
            </p>
            <p className="text-[11px] text-cyan-200/90 font-medium line-clamp-1 hidden sm:block">
              {current.text}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-emerald-300 drop-shadow shrink-0">
            <Calendar size={12} className="text-amber-300" />
            <span>{formatDateDisplay(current.date, current.time)}</span>
          </div>
        </div>
      </div>

      {/* 3. Rótulo inferior destacado: AGENDA CONGREGACIONAL con enlace a gestión en /events */}
      <div className="z-10 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Actividades & Reuniones
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400">
              Cambia cada 3s
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
            AGENDA CONGREGACIONAL
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 max-w-lg line-clamp-1">
            {current.text || 'Consulta la agenda completa de reuniones, congresos y células en el módulo de eventos.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleNavigateToEvents}
          className="self-start sm:self-end inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 shrink-0 cursor-pointer"
          title="Abrir módulo de eventos para gestionar o ver la agenda completa"
        >
          <span>Ver Agenda</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

// Alias para retrocompatibilidad total con código existente
export const BentoNovedades = BentoProximosEventos;
