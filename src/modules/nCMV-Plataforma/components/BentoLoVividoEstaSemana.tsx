import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Avance automático cada 4 segundos
  useEffect(() => {
    if (isPaused || highlights.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 4000);

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

  const current = highlights[currentIndex] || {
    id: 'placeholder-vivido',
    title: 'Novedades celula Zaeta',
    text: 'Esta semana la celula Zaeta tendra encuentro de bienvenida para nuevos hermanos.',
    date: '2026-10-25',
    badge: 'Zaeta',
    image: '/cmv-fellowship.jpg',
    mediaType: 'image' as const,
  };

  const isVideo = current.mediaType === 'video' || Boolean(current.video);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={onOpenEvents ? onOpenEvents : () => navigate('/events?tab=vivido')}
      className="relative group overflow-hidden rounded-3xl bg-slate-950 border border-emerald-500/30 dark:border-emerald-400/25 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 flex flex-col justify-end p-4 sm:p-5 col-span-1 min-h-[360px] sm:min-h-[380px] h-full w-full max-w-full min-w-0 select-none cursor-pointer"
    >
      {/* 1. Fondo Multimedia completo (Fotografía o Video 7s) */}
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
        {/* Degradado cinematográfico inferior para legibilidad idéntica a la imagen de referencia */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Contenido Informativo exacto a la imagen de referencia */}
      <div className="relative z-10 flex flex-col justify-end w-full space-y-1 mt-auto">
        {/* Título Principal en dos líneas: LO VIVIDO ESTA SEMANA */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-md">
          LO VIVIDO ESTA<br />SEMANA
        </h2>

        {/* Subtítulo: Título actual (ej: Novedades celula Zaeta) */}
        <p className="text-sm sm:text-base font-black text-white drop-shadow-sm pt-1 leading-tight">
          {current.title}
        </p>

        {/* Descripción en verde/esmeralda suave */}
        <p className="text-xs sm:text-[13px] font-semibold text-[#00dfa2] dark:text-emerald-300 drop-shadow-sm leading-snug line-clamp-3">
          {current.text}
        </p>

        {/* 3. Controles del carrusel en la parte de abajo con conteo en el medio */}
        <div className="pt-3 flex flex-col items-center gap-2 w-full">
          {/* Contador y flechas en el medio: 3/6 < > */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-md">
            <span className="text-[11px] font-mono font-bold text-gray-300 select-none">
              {currentIndex + 1}/{highlights.length || 1}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Anterior momento"
              className="w-5 h-5 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente momento"
              className="w-5 h-5 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Barras segmentadas del carrusel en la parte inferior */}
          <div className="w-full flex items-center gap-1.5 pt-0.5">
            {highlights.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleSelectSlide(idx, e)}
                aria-label={`Ir a historia ${idx + 1}`}
                className="flex-1 h-1.5 rounded-full bg-white/25 hover:bg-white/45 transition-all overflow-hidden cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};
