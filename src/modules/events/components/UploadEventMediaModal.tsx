import React, { useState, ChangeEvent } from 'react';
import { Camera, Film, Sparkles, Upload, X, Check, Heart, MessageSquare } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { eventsService, PublicationItem } from '../../../services/eventsService';
import { User } from '../../../types';

interface UploadEventMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PublicationItem | null;
  user: User;
  onSuccess: (message: string) => void;
  canManageEvents?: boolean;
}

export const UploadEventMediaModal: React.FC<UploadEventMediaModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  onSuccess,
  canManageEvents = false,
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [authorName, setAuthorName] = useState(user.name || '');
  const [isHighlight, setIsHighlight] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      setError('Por favor selecciona una foto o video para compartir.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const currentUser: User = {
      ...user,
      name: authorName.trim() || user.name || 'Hermano de la comunidad',
    };

    const created = eventsService.addMediaToEvent(
      event.id,
      {
        url: mediaUrl,
        mediaType,
        caption: caption.trim() || undefined,
        isHighlight: canManageEvents ? isHighlight : false,
      },
      currentUser,
    );

    setIsSubmitting(false);

    if (created) {
      onSuccess(
        created.status === 'aprobado'
          ? '¡Material agregado exitosamente a lo vivido del evento!'
          : '¡Gracias por compartir! Tu aporte quedó registrado para revisión pastoral.',
      );
      handleClose();
    } else {
      setError('Ocurrió un error al guardar el material.');
    }
  };

  const handleClose = () => {
    setMediaUrl('');
    setCaption('');
    setIsHighlight(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subir Fotos / Testimonio del Evento">
      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        {/* Banner informativo del evento con obsidian y esmeralda */}
        <div className="p-4 rounded-2xl bg-[#071612]/90 border border-emerald-500/30 flex items-start gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-[#00dfa2] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-[#00dfa2]">
              {event.badge || 'Evento Programado'}
            </span>
            <h4 className="text-base font-black text-white truncate">
              {event.title}
            </h4>
            <p className="text-xs text-slate-300 font-medium">
              Fecha: {event.date || 'Reciente'} {event.time ? `• ${event.time} hs` : ''}
            </p>
          </div>
        </div>

        {/* Selector de formato: Foto o Video corto */}
        <div className="flex items-center justify-between p-1 bg-black/50 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setMediaType('image')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mediaType === 'image'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={16} className={mediaType === 'image' ? 'text-black' : 'text-[#c5a059]'} />
            <span>Fotografía</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mediaType === 'video'
                ? 'bg-[#00dfa2] text-black shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film size={16} />
            <span>Video Corto (7s)</span>
          </button>
        </div>

        {/* Carga del archivo con dropzone de lujo */}
        <div className="space-y-2">
          {mediaType === 'image' ? (
            <label className="block w-full p-4 rounded-2xl border-2 border-dashed border-[#c5a059]/40 bg-[#c5a059]/5 text-center cursor-pointer hover:bg-[#c5a059]/10 transition-colors">
              <Upload size={24} className="mx-auto mb-1.5 text-[#c5a059]" />
              <span className="font-bold text-sm text-white block">
                Selecciona una foto desde tu celular o computadora
              </span>
              <span className="text-xs text-[#c5a059]/90 font-medium">
                Formatos JPG, PNG, WebP en alta calidad
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <label className="block w-full p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 text-center cursor-pointer hover:bg-emerald-500/10 transition-colors">
              <Film size={24} className="mx-auto mb-1.5 text-[#00dfa2]" />
              <span className="font-bold text-sm text-white block">
                Selecciona un video corto (ideal formato vertical Reel)
              </span>
              <span className="text-xs text-emerald-300/90 font-medium">
                Formatos MP4, WebM o MOV
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* O ingreso por URL */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400 shrink-0">O URL:</span>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'image' ? 'https://... o /foto.jpg' : 'https://... o /video.mp4'}
              className="flex-1 p-3 text-sm rounded-xl border border-white/10 bg-black/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2]"
            />
          </div>

          {/* Previsualización del medio seleccionado */}
          {mediaUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 aspect-video bg-black max-h-52">
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                title="Quitar archivo"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Nombre del autor */}
        <div>
          <label className="block text-xs sm:text-sm uppercase tracking-wider font-bold text-slate-300 mb-1.5">
            Tu nombre o célula que comparte
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="ej. Familia Gómez - Célula Zaeta"
            className="w-full p-3.5 text-sm rounded-xl border border-white/15 bg-black/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2]"
            required
          />
        </div>

        {/* Testimonio / Breve reseña */}
        <div>
          <label className="block text-xs sm:text-sm uppercase tracking-wider font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare size={15} className="text-[#c5a059]" />
            <span>Testimonio / Lo que vivimos (opcional)</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Cuéntanos brevemente qué hizo Dios o qué fue lo más bendecido de este momento..."
            className="w-full p-3.5 text-sm rounded-xl border border-white/15 bg-black/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfa2] resize-none"
          />
        </div>

        {/* Switch para administradores y pastores: Destacar en Lo Vivido Esta Semana */}
        {canManageEvents && (
          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-black/60 border border-amber-500/35 cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1">
                <Sparkles size={14} className="text-[#c5a059]" />
                Destacar inmediatamente en la portada ("Lo Vivido Esta Semana")
              </span>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Rotará en el carrusel principal de la pantalla de inicio para toda la comunidad.
              </p>
            </div>
          </label>
        )}

        {error && (
          <p className="text-xs sm:text-sm text-rose-400 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            {error}
          </p>
        )}

        {/* Botones de acción con tipografía grande y legible */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="py-3.5 px-5 rounded-xl border border-white/10 text-sm font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !mediaUrl}
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00dfa2] hover:brightness-110 disabled:opacity-50 text-black text-sm sm:text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={18} />
            <span>Compartir Aporte</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
