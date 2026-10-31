import React, { useState, ChangeEvent } from 'react';
import {
  Check,
  Calendar,
  Camera,
  Film,
  Sparkles,
  Upload,
  X,
  Clock,
  ArrowRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { eventsService, PublicationItem } from '../../../services/eventsService';
import { User } from '../../../types';

interface ConcludeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PublicationItem | null;
  user: User;
  onSuccess: (message: string) => void;
}

export const ConcludeEventModal: React.FC<ConcludeEventModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  onSuccess,
}) => {
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState(event?.time || '19:30');
  const [nextTitle, setNextTitle] = useState(event?.title || '');
  
  const [uploadMedia, setUploadMedia] = useState(true);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [authorName, setAuthorName] = useState(user.name || '');
  const [isHighlight, setIsHighlight] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setMediaUrl(result);
      setMediaType('image');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setMediaUrl(result);
      setMediaType('video');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Concluir el evento actual
      if (event.status !== 'concluido') {
        eventsService.toggleEventStatus(event.id, user);
      }

      // 2. Si se adjuntó material de lo sucedido, guardarlo como aporte comunitario
      if (uploadMedia && mediaUrl.trim()) {
        eventsService.addMediaToEvent(
          event.id,
          {
            url: mediaUrl,
            mediaType,
            caption: caption.trim() || undefined,
            isHighlight,
          },
          {
            ...user,
            name: authorName.trim() || user.name || 'Líder / Congregante',
          },
        );

        // Si se seleccionó destacar en Lo Vivido Esta Semana, marcar la publicación
        if (isHighlight && !event.isLoVivido) {
          eventsService.toggleLoVivido(event.id, user);
        }
      }

      // 3. Si se activó programar la próxima fecha, crear el nuevo próximo evento en agenda
      if (scheduleNext && nextDate.trim()) {
        eventsService.upsertPublication(
          {
            kind: 'evento',
            visibility: event.visibility,
            title: nextTitle.trim() || event.title,
            date: nextDate.trim(),
            time: nextTime.trim() || undefined,
            text: `Próximo encuentro de ${event.title}. Te invitamos a ser parte de esta bendición.`,
            badge: event.badge || 'AGENDA',
            status: 'proximo',
            isLoVivido: false,
            mediaType: event.mediaType || 'image',
            image: event.image,
            video: event.video,
            involved: event.involved,
          },
          user,
        );
      }

      setIsSubmitting(false);
      onSuccess(
        scheduleNext && nextDate.trim()
          ? `¡Evento "${event.title}" concluido y próxima fecha agendada para el ${nextDate}!`
          : `¡Evento "${event.title}" concluido y archivado en lo vivido comunitario!`,
      );
      handleClose();
    } catch (err) {
      setIsSubmitting(false);
      setError('Ocurrió un error al procesar el cierre del evento.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Concluir Evento & Registrar Lo Vivido">
      <form onSubmit={handleSubmit} className="space-y-6 text-white p-1">
        {/* Banner Informativo del Evento */}
        <div className="p-4 rounded-2xl bg-[#071612]/95 border border-emerald-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-[#00dfa2] border border-emerald-500/40">
              Concluyendo Evento
            </span>
            <span className="text-xs font-bold text-slate-300">
              Fecha: {event.date || 'Reciente'} {event.time ? `• ${event.time} hs` : ''}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Este evento pasará a la sección de <strong>Lo Vivido Comunitario</strong> para que los hermanos puedan ver las fotos y testimonios.
          </p>
        </div>

        {/* PARTE 1: PROGRAMAR LA PRÓXIMA FECHA EN AGENDA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-cyan-500/35 space-y-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  ¿Cuándo será el próximo encuentro?
                </h4>
                <p className="text-xs text-cyan-200/80">
                  Agenda de inmediato la siguiente fecha en el calendario semanal.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 ring-1 ring-white/20"></div>
            </label>
          </div>

          {scheduleNext && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                    Próxima Fecha *
                  </label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-cyan-500/30 bg-black/80 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required={scheduleNext}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                    Hora (ej. 19:30 hs)
                  </label>
                  <input
                    type="text"
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    placeholder="19:30 hs"
                    className="w-full p-3 rounded-xl border border-white/15 bg-black/80 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1">
                  Título para el Próximo Encuentro
                </label>
                <input
                  type="text"
                  value={nextTitle}
                  onChange={(e) => setNextTitle(e.target.value)}
                  placeholder={event.title}
                  className="w-full p-3 rounded-xl border border-white/15 bg-black/80 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* PARTE 2: CARGAR FOTO / VIDEO CORTO DE LO SUCEDIDO (LO VIVIDO ESTA SEMANA) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-emerald-500/35 space-y-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#00dfa2] flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  Cargar foto o video de lo sucedido
                </h4>
                <p className="text-xs text-emerald-200/80">
                  Comparte material para alimentar "Lo Vivido Esta Semana".
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={uploadMedia}
                onChange={(e) => setUploadMedia(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00dfa2] ring-1 ring-white/20"></div>
            </label>
          </div>

          {uploadMedia && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              {/* Selector de formato: Foto o Video 7s */}
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'image'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera size={14} />
                  <span>Fotografía</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'video'
                      ? 'bg-[#00dfa2] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film size={14} />
                  <span>Video Corto (7s)</span>
                </button>
              </div>

              {/* Dropzone */}
              {mediaType === 'image' ? (
                <label className="block w-full p-4 rounded-xl border-2 border-dashed border-[#c5a059]/40 bg-[#c5a059]/5 text-center cursor-pointer hover:bg-[#c5a059]/10 transition-colors">
                  <Camera size={22} className="mx-auto mb-1 text-[#c5a059]" />
                  <span className="font-bold text-xs text-white block">
                    Seleccionar Foto de lo Acontecido
                  </span>
                  <span className="text-[11px] text-[#c5a059]/80">JPG, PNG o WebP</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
              ) : (
                <label className="block w-full p-4 rounded-xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 text-center cursor-pointer hover:bg-emerald-500/10 transition-colors">
                  <Film size={22} className="mx-auto mb-1 text-[#00dfa2]" />
                  <span className="font-bold text-xs text-white block">
                    Seleccionar Video Corto de 7s (Reel)
                  </span>
                  <span className="text-[11px] text-emerald-300/80">MP4, WebM o MOV</span>
                  <input type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" />
                </label>
              )}

              {/* O URL */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 shrink-0">O URL:</span>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://... o /foto.jpg"
                  className="flex-1 p-2.5 text-xs rounded-xl border border-white/10 bg-black/60 text-white"
                />
              </div>

              {/* Previsualización */}
              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 aspect-video bg-black max-h-48">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} controls playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Testimonio */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-[#c5a059]" />
                  <span>Testimonio / Resumen de lo que Dios hizo</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="Breve reseña de lo vivido en esta reunión..."
                  className="w-full p-2.5 text-xs rounded-xl border border-white/15 bg-black/80 text-white resize-none"
                />
              </div>

              {/* Switch para destacar en portada */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/60 to-black/60 border border-amber-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHighlight}
                  onChange={(e) => setIsHighlight(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Sparkles size={13} className="text-[#c5a059]" />
                    Destacar de inmediato en "Lo Vivido Esta Semana" (Portada de Inicio)
                  </span>
                  <p className="text-[11px] text-amber-200/70">
                    Rotará automáticamente en el carrusel principal para toda la comunidad.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            {error}
          </p>
        )}

        {/* Botones de acción con tipografía grande y legible */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="py-3 px-5 rounded-2xl border border-white/15 text-sm font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00dfa2] hover:brightness-110 disabled:opacity-50 text-black text-sm sm:text-base font-black uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Check size={20} />
            <span>Concluir Evento & Guardar Registro</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
