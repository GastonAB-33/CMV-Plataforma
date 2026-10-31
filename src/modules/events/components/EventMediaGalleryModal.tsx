import React, { useState } from 'react';
import { Camera, Film, Sparkles, Trash2, CheckCircle2, Clock, Plus, Star } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { eventsService, EventMediaItem, PublicationItem } from '../../../services/eventsService';
import { User } from '../../../types';

interface EventMediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PublicationItem | null;
  user: User;
  canManageEvents: boolean;
  onOpenUpload: () => void;
  onUpdate: () => void;
}

export const EventMediaGalleryModal: React.FC<EventMediaGalleryModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  canManageEvents,
  onOpenUpload,
  onUpdate,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<EventMediaItem | null>(null);

  if (!isOpen || !event) return null;

  const mediaList: EventMediaItem[] = event.mediaItems || [];

  const handleToggleHighlight = (media: EventMediaItem) => {
    if (!canManageEvents) return;
    const nextHighlight = !media.isHighlight;
    eventsService.updateMediaItem(
      event.id,
      media.id,
      { isHighlight: nextHighlight, status: 'aprobado' },
      user,
    );
    onUpdate();
  };

  const handleApprove = (media: EventMediaItem) => {
    if (!canManageEvents) return;
    eventsService.updateMediaItem(event.id, media.id, { status: 'aprobado' }, user);
    onUpdate();
  };

  const handleDelete = (media: EventMediaItem) => {
    if (!canManageEvents && media.uploadedBy !== user.name) return;
    const confirmed = window.confirm('¿Deseas eliminar este aporte multimedia?');
    if (!confirmed) return;
    eventsService.deleteMediaItem(event.id, media.id, user);
    if (selectedMedia?.id === media.id) {
      setSelectedMedia(null);
    }
    onUpdate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Galería & Lo Vivido: ${event.title}`}
    >
      <div className="space-y-5 text-white">
        {/* Encabezado con datos del evento y botón para subir más */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#071612]/90 border border-emerald-500/30 shadow-md">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#00dfa2]">
              {event.badge || 'LO VIVIDO MV'} • {event.date || 'Evento'}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              {mediaList.length} {mediaList.length === 1 ? 'aporte comunitario registrado' : 'aportes comunitarios registrados'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00dfa2] hover:brightness-110 text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Subir Fotos / Video</span>
          </button>
        </div>

        {/* Visor expandido si hay uno seleccionado */}
        {selectedMedia && (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black shadow-2xl">
            <div className="max-h-[380px] flex items-center justify-center bg-black">
              {selectedMedia.mediaType === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[380px] object-contain"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || 'Foto del evento'}
                  className="w-full max-h-[380px] object-contain"
                />
              )}
            </div>

            <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-white space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-black text-[#00dfa2] block">
                    Aporte de: {selectedMedia.uploadedBy}
                  </span>
                  {selectedMedia.caption && (
                    <p className="text-xs sm:text-sm text-slate-200 mt-1 italic font-medium">
                      "{selectedMedia.caption}"
                    </p>
                  )}
                </div>

                {canManageEvents && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleHighlight(selectedMedia)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        selectedMedia.isHighlight
                          ? 'bg-[#c5a059] text-black shadow-md'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      title="Destacar en portada 'Lo Vivido Esta Semana'"
                    >
                      <Star size={13} className={selectedMedia.isHighlight ? 'fill-black' : ''} />
                      <span>{selectedMedia.isHighlight ? 'En Portada' : 'Poner en Portada'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMedia)}
                      className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition-colors cursor-pointer"
                      title="Eliminar este aporte"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cuadrícula de miniaturas */}
        {mediaList.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-black/40 text-slate-400 space-y-3">
            <Camera size={36} className="mx-auto text-slate-500" />
            <p className="text-base font-bold text-white">Aún no se han compartido fotos o videos para este evento.</p>
            <p className="text-sm text-slate-300">¡Sé el primero en compartir tu testimonio o fotos de lo vivido!</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              <Plus size={16} />
              <span>Subir primer aporte</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mediaList.map((media) => {
              const isSelected = selectedMedia?.id === media.id;
              return (
                <div
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className={`group relative rounded-2xl overflow-hidden aspect-square border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#00dfa2] ring-2 ring-[#00dfa2]/60 scale-[1.02]'
                      : 'border-white/10 hover:border-emerald-400/50'
                  }`}
                >
                  {media.mediaType === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.caption || 'Miniatura'}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Insignias superiores sobre la miniatura */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    <span className="p-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-black uppercase">
                      {media.mediaType === 'video' ? <Film size={12} /> : <Camera size={12} />}
                    </span>

                    {media.isHighlight && (
                      <span className="p-1 rounded-md bg-amber-400 text-black text-[10px] font-black shadow-sm" title="Destacado en portada">
                        <Star size={12} className="fill-black" />
                      </span>
                    )}
                  </div>

                  {/* Pie de la miniatura con autor */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                    <p className="text-xs text-white font-bold truncate leading-tight">
                      {media.uploadedBy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
