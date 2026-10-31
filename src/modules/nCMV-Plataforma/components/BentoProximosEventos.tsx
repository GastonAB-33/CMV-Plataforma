import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Layers,
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

  // Transición automática cada 4 segundos
  useEffect(() => {
    if (isPaused || events.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, events.length, currentIndex]);

  // Si cambia el slide y es video, reiniciar reproducción fluida
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleSelectSlide = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const handleNavigateToEvents = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onOpenEvents) {
      onOpenEvents();
    } else {
      navigate('/events?tab=proximos');
    }
  };

  const current = events[currentIndex] || {
    id: 'placeholder',
    title: 'Noche de Avivamiento & Adoración',
    text: 'Tiempo especial de alabanza comunitaria, palabra viva y manifestación del Espíritu Santo.',
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
      onClick={handleNavigateToEvents}
      className="relative group overflow-hidden rounded-3xl bg-slate-950 border border-cyan-500/30 dark:border-cyan-400/25 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 transition-all duration-500 flex flex-col justify-between p-4 sm:p-5 col-span-1 md:col-span-2 lg:col-span-2 min-h-[360px] sm:min-h-[380px] h-full w-full max-w-full min-w-0 select-none cursor-pointer"
    >
      {/* 1. Fondo Multimedia completo (Fotografía o Video 7s) idéntico a Lo Vivido Esta Semana */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isVideo && current.video ? (
          <video
            ref={videoRef}
            key={current.video || current.id}
            src={current.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover brightness-[0.92] contrast-105"
          />
        ) : (
          <img
            key={current.image || current.id}
            src={current.image || '/cmv-fellowship.jpg'}
            alt={current.title}
            className="w-full h-full object-cover brightness-[0.92] contrast-105 transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {/* Degradado cinematográfico inferior para legibilidad idéntica a Lo Vivido */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* 2. Encabezado superior con etiqueta AGENDA y botón VER AGENDA */}
      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-md">
            <Calendar size={13} className="text-[#00dfa2]" />
            <span>AGENDA</span>
          </span>
          {current.badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-bold uppercase tracking-wider hidden sm:inline-flex shadow-sm">
              <Layers size={11} className="text-cyan-400" />
              <span>{current.badge}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNavigateToEvents}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-cyan-400/50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          title="Ver agenda completa de eventos"
        >
          <span>VER AGENDA</span>
          <ArrowRight size={13} className="text-cyan-300" />
        </button>
      </div>

      {/* 3. Contenido Informativo inferior con estética y tipografía idéntica a Lo Vivido */}
      <div className="relative z-10 flex flex-col justify-end w-full space-y-1 mt-auto pt-6">
        {/* Título Principal en dos líneas: PRÓXIMOS EVENTOS */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-md">
          PRÓXIMOS<br />EVENTOS
        </h2>

        {/* Subtítulo: Título actual + fecha y hora */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <p className="text-sm sm:text-base font-black text-white drop-shadow-sm leading-tight">
            {current.title}
          </p>
          {current.date && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300 drop-shadow">
              <Clock size={11} className="text-amber-300" />
              <span>{formatDateDisplay(current.date, current.time)}</span>
            </span>
          )}
        </div>

        {/* Descripción en cian / esmeralda suave */}
        <p className="text-xs sm:text-[13px] font-semibold text-cyan-300 dark:text-cyan-200 drop-shadow-sm leading-snug line-clamp-2 max-w-2xl">
          {current.text}
        </p>

        {/* 4. Controles del carrusel en la parte inferior con contador en el medio y barras segmentadas */}
        <div className="pt-3 flex flex-col items-center gap-2 w-full">
          {/* Contador y flechas en el medio: 1/4 < > */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-md">
            <span className="text-[11px] font-mono font-bold text-gray-300 select-none">
              {currentIndex + 1}/{events.length || 1}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Anterior evento"
              className="w-5 h-5 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente evento"
              className="w-5 h-5 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Barras segmentadas del carrusel en la parte inferior */}
          <div className="w-full flex items-center gap-1.5 pt-0.5">
            {events.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleSelectSlide(idx, e)}
                aria-label={`Ir a evento ${idx + 1}`}
                className="flex-1 h-1.5 rounded-full bg-white/25 hover:bg-white/45 transition-all overflow-hidden cursor-pointer"
              >
                <div
                  className={`h-full bg-cyan-300 transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-full shadow-sm'
                      : idx < currentIndex
                      ? 'w-full bg-white/80'
                      : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alias para retrocompatibilidad total con código existente
export const BentoNovedades = BentoProximosEventos;
