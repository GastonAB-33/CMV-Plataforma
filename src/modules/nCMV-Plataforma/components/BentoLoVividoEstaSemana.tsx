import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Film,
  Camera,
  HeartHandshake,
} from 'lucide-react';
import { eventsService, PublicationItem } from '../../../services/eventsService';

interface BentoLoVividoEstaSemanaProps {
  onOpenEvents?: () => void;
}

export const BentoLoVividoEstaSemana: React.FC<BentoLoVividoEstaSemanaProps> = ({ onOpenEvents }) => {
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<PublicationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadHighlights = () => {
      const items = eventsService.listLoVividoEstaSemana();
      setHighlights(items);
    };

    loadHighlights();

    window.addEventListener('cmv_events_updated', loadHighlights);
    window.addEventListener('storage', loadHighlights);

    return () => {
      window.removeEventListener('cmv_events_updated', loadHighlights);
      window.removeEventListener('storage', loadHighlights);
    };
  }, []);

  // Avance automático cada 3 segundos
  useEffect(() => {
    if (isPaused || highlights.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, highlights.length, currentIndex]);

  // Si cambia el slide y contiene video, reiniciar la reproducción fluida de 7 segundos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (highlights.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (highlights.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  const handleSelectSlide = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const handleNavigate = () => {
    if (onOpenEvents) {
      onOpenEvents();
    } else {
      navigate('/events');
    }
  };

  const current = highlights[currentIndex] || {
    id: 'placeholder-vivido',
    title: 'Célula de Jóvenes: Clamor & Adoración',
    text: 'Noche de rendición y presencia viva de Dios con más de 50 jóvenes reunidos.',
    date: '2026-10-25',
    badge: 'Jóvenes CMV',
    video: '/cmv-event-short.mp4',
    mediaType: 'video' as const,
  };

  const isVideo = current.mediaType === 'video' || Boolean(current.video);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#071612] border border-emerald-500/30 dark:border-emerald-400/25 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 flex flex-col justify-between p-4 sm:p-5 col-span-1 min-h-[380px] h-full"
    >
      {/* Resplandor sutil esmeralda de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/15 via-emerald-500/5 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* 1. Encabezado superior: Título completo visible sin cortes + controles de navegación */}
      <div className="flex items-center justify-between z-10 mb-2 gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider shadow-2xs whitespace-nowrap shrink-0">
          <Sparkles size={13} className="text-[#00dfa2] shrink-0" />
          <span>LO VIVIDO ESTA SEMANA</span>
        </span>

        {/* Indicador numérico y flechas de navegación */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400 select-none mr-0.5">
            {currentIndex + 1}/{highlights.length || 1}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Anterior momento"
            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-transform active:scale-90"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente momento"
            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition-transform active:scale-90"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Visualizador Multimedia Vertical: Ocupa todo el espacio disponible como un Story/Reel vertical */}
      <div className="relative z-10 flex-1 w-full min-h-[260px] sm:min-h-[300px] my-1 rounded-2xl overflow-hidden bg-black border border-slate-200/80 dark:border-white/10 shadow-md group-hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
        {/* Barras de progreso estilo Story en la parte superior del contenedor */}
        <div className="absolute top-2 left-2.5 right-2.5 z-30 flex items-center gap-1 pointer-events-auto">
          {highlights.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleSelectSlide(idx, e)}
              aria-label={`Ir a historia ${idx + 1}`}
              className="flex-1 h-1 rounded-full bg-white/25 hover:bg-white/50 transition-all overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
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

        {/* Medio visual: Video vertical o Fotografía expandida */}
        <div className="absolute inset-0">
          {isVideo && current.video ? (
            <video
              ref={videoRef}
              src={current.video}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover brightness-[0.93] contrast-105"
            />
          ) : (
            <img
              src={current.image || '/cmv-fellowship.jpg'}
              alt={current.title}
              className="w-full h-full object-cover brightness-[0.93] contrast-105 transition-transform duration-700 group-hover:scale-105"
            />
          )}

          {/* Degradado sobre la imagen/video para legibilidad total del contenido */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
        </div>

        {/* Insignias superiores flotantes justo debajo de las barras de progreso */}
        <div className="relative z-20 flex items-center justify-between p-2.5 pt-4 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/25 text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm">
            {isVideo ? (
              <>
                <Film size={10} className="text-emerald-400 animate-pulse" />
                <span>VIDEO CORTO (7S)</span>
              </>
            ) : (
              <>
                <Camera size={10} className="text-amber-300" />
                <span>FOTOGRAFÍA</span>
              </>
            )}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9.5px] font-black uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <HeartHandshake size={10} />
            <span>{current.badge || 'Comunidad'}</span>
          </span>
        </div>

        {/* Título y descripción integrados en la parte inferior del contenedor vertical */}
        <div className="relative z-20 p-3 pt-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
          <h4 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md">
            {current.title}
          </h4>
          <p className="text-[11px] text-emerald-200/90 font-medium line-clamp-2 mt-1 drop-shadow-sm leading-snug">
            {current.text}
          </p>
        </div>
      </div>

      {/* 3. Pie de la tarjeta: Títulos claros sin truncamiento y botón de acción */}
      <div className="relative z-10 pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5 mt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <Flame size={12} className="text-amber-500 shrink-0" />
            <span>Vida Congregacional</span>
          </div>
          <p className="text-[10.5px] text-slate-500 dark:text-gray-400 truncate mt-0.5">
            Testimonios de esta semana
          </p>
        </div>

        <button
          type="button"
          onClick={handleNavigate}
          className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>VER MÁS</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
