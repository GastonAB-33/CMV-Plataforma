import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  RotateCcw,
  Check,
  Film,
  Sparkles,
} from 'lucide-react';

export interface BannerMediaConfig {
  mediaType: 'image' | 'video';
  mediaUrl: string;
  videoDurationSeconds?: number;
}

export const DEFAULT_BANNER_CONFIG: BannerMediaConfig = {
  mediaType: 'image',
  mediaUrl: '/banner-hermanos.jpg',
  videoDurationSeconds: 8,
};

interface BannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: BannerMediaConfig) => void;
  currentConfig?: BannerMediaConfig;
}

export const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    currentConfig?.mediaType || DEFAULT_BANNER_CONFIG.mediaType
  );
  const [mediaUrl, setMediaUrl] = useState<string>(
    currentConfig?.mediaUrl || DEFAULT_BANNER_CONFIG.mediaUrl
  );
  const [videoDuration, setVideoDuration] = useState<number>(
    currentConfig?.videoDurationSeconds || DEFAULT_BANNER_CONFIG.videoDurationSeconds || 8
  );
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMediaType(currentConfig?.mediaType || DEFAULT_BANNER_CONFIG.mediaType);
      setMediaUrl(currentConfig?.mediaUrl || DEFAULT_BANNER_CONFIG.mediaUrl);
      setVideoDuration(currentConfig?.videoDurationSeconds || 8);
      setPreviewError(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  // Galería de recursos reales disponibles en la plataforma
  const REAL_IMAGE_PRESETS = [
    {
      title: 'Congregación en Alabanza (Oficial)',
      url: '/banner-hermanos.jpg',
      badge: 'Recomendado',
    },
    {
      title: 'Comunidad & Hermandad CMV',
      url: '/church-gathering.jpg',
      badge: 'Hermandad',
    },
    {
      title: 'Compañerismo & Grupo Familiar',
      url: '/cmv-fellowship.jpg',
      badge: 'Familia',
    },
    {
      title: 'Altar & Adoración',
      url: '/cmv-bienvenido-casa.jpg',
      badge: 'Devocional',
    },
    {
      title: 'Reunión Congregacional',
      url: '/cmv-novedades.jpg',
      badge: 'Pastoral',
    },
  ];

  const REAL_VIDEO_PRESETS = [
    {
      title: 'Clip Dinámico Congregacional (7s)',
      url: '/cmv-event-short.mp4',
      badge: 'Loop 7s',
    },
    {
      title: 'Clip de Evento & Alabanza (10s)',
      url: '/sample-event-video.mp4',
      badge: 'Loop 10s',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Por favor selecciona un archivo de imagen o video válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaType(isVideo ? 'video' : 'image');
        setMediaUrl(result);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const finalConfig: BannerMediaConfig = {
      mediaType,
      mediaUrl: mediaUrl.trim() || DEFAULT_BANNER_CONFIG.mediaUrl,
      videoDurationSeconds: videoDuration,
    };
    onSave(finalConfig);
    onClose();
  };

  const handleReset = () => {
    setMediaType(DEFAULT_BANNER_CONFIG.mediaType);
    setMediaUrl(DEFAULT_BANNER_CONFIG.mediaUrl);
    setVideoDuration(8);
    setPreviewError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#091522] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#07111c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
              <Film size={17} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Editar Banner Principal
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Cambia la fotografía o video corto (7 a 10s) de fondo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Selector de Tipo: Fotografía o Video corto */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Presentación Visual
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMediaType('image');
                  if (mediaUrl.endsWith('.mp4') || mediaUrl.startsWith('data:video')) {
                    setMediaUrl(DEFAULT_BANNER_CONFIG.mediaUrl);
                  }
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  mediaType === 'image'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:border-white/20'
                }`}
              >
                <ImageIcon size={16} />
                <span>Fotografía / Imagen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  if (!mediaUrl.endsWith('.mp4') && !mediaUrl.startsWith('data:video')) {
                    setMediaUrl(REAL_VIDEO_PRESETS[0].url);
                  }
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  mediaType === 'video'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:border-white/20'
                }`}
              >
                <VideoIcon size={16} />
                <span>Video Corto (7-10s)</span>
              </button>
            </div>
          </div>

          {/* Vista previa en vivo del Banner */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Vista Previa en Vivo
            </label>
            <div className="relative w-full aspect-[21/9] sm:aspect-[16/6] rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-white/10 shadow-inner">
              {mediaType === 'video' ? (
                <video
                  ref={videoPreviewRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Vista previa del banner"
                  className="w-full h-full object-cover object-[center_35%]"
                  onError={() => setPreviewError(true)}
                />
              )}

              {/* Degradé simulado del banner */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#06122d]/85 via-[#0284c7]/60 to-[#059669]/60" />

              {/* Muestra de texto simulado */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <p className="font-cursive-motto text-lg sm:text-2xl text-white drop-shadow leading-tight line-clamp-2 max-w-xl">
                  Llevar las aguas de este manantial a cada hogar, ciudad, nación hasta lo último de la tierra en el poder del Espíritu Santo
                </p>
                <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-white font-bold uppercase">
                    GANAR
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-white font-bold uppercase">
                    CONSOLIDAR
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-white font-bold uppercase">
                    DISCIPULAR
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-white font-bold uppercase">
                    ENVIAR
                  </span>
                </div>
              </div>

              {previewError && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs text-rose-300 font-bold">
                  No se pudo cargar el archivo. Por favor verifica la URL o formato.
                </div>
              )}
            </div>
          </div>

          {/* Subir archivo desde dispositivo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Subir Imagen o Video Real desde tu Equipo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Upload size={16} />
              <span>
                {mediaType === 'image'
                  ? 'Seleccionar Foto Real de tu PC'
                  : 'Seleccionar Video de 7 a 10s de tu PC'}
              </span>
            </button>
          </div>

          {/* O ingresar URL manual */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              O ingresa la URL de la {mediaType === 'image' ? 'imagen' : 'video'}
            </label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setPreviewError(false);
              }}
              placeholder={mediaType === 'image' ? '/banner-hermanos.jpg' : '/cmv-event-short.mp4'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#07131f] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Galería de presets recomendados de CMV */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-amber-400" />
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fotografías y Videos Reales Disponibles en CMV
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(mediaType === 'image' ? REAL_IMAGE_PRESETS : REAL_VIDEO_PRESETS).map((preset) => (
                <div
                  key={preset.url}
                  onClick={() => {
                    setMediaUrl(preset.url);
                    setPreviewError(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    mediaUrl === preset.url
                      ? 'border-cyan-400 bg-cyan-500/15 text-slate-900 dark:text-white shadow-xs'
                      : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-gray-300'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{preset.title}</p>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                      {preset.badge}
                    </span>
                  </div>
                  {mediaUrl === preset.url && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuración de Duración (para video) */}
          {mediaType === 'video' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              <span className="font-bold text-slate-700 dark:text-gray-300">
                Duración de reproducción en bucle (Loop):
              </span>
              <div className="flex items-center gap-2">
                {[7, 8, 10].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setVideoDuration(sec)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      videoDuration === sec
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    {sec} seg
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie de acciones */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#07111c]">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Restablecer Original</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#00dfa2] to-[#0ea5e9] hover:from-[#05b383] hover:to-[#0284c7] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>Guardar Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
