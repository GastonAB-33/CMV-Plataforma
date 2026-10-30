import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Sparkles,
  LogOut,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Toast } from '../../components/ui/Toast';
import { BentoProximosEventos } from './components/BentoProximosEventos';
import { BentoLoVividoEstaSemana } from './components/BentoLoVividoEstaSemana';
import { BentoCardBienvenido } from './components/BentoCardBienvenido';
import { BentoCardGeneral } from './components/BentoCardGeneral';
import { BentoCardSeguimiento } from './components/BentoCardSeguimiento';
import { BentoCardAltares } from './components/BentoCardAltares';
import { BentoCardGruposVida } from './components/BentoCardGruposVida';
import { BentoCardLiderazgo } from './components/BentoCardLiderazgo';
import {
  BannerEditorModal,
  BannerMediaConfig,
  DEFAULT_BANNER_CONFIG,
} from './components/BannerEditorModal';

import { FichaBienvenidaModal } from '../primeros-pasos/components/FichaBienvenidaModal';
import { FichaBienvenida } from '../primeros-pasos/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estado para el modal de Ficha de Bienvenida (Nuevo Hermano)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Estado para configuración multimedia del Banner Principal (Fotografía o Video 7-10s)
  const [bannerConfig, setBannerConfig] = useState<BannerMediaConfig>(() => {
    const saved = localStorage.getItem('cmv_banner_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_BANNER_CONFIG;
  });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const handleSaveBannerConfig = (newConfig: BannerMediaConfig) => {
    setBannerConfig(newConfig);
    localStorage.setItem('cmv_banner_config', JSON.stringify(newConfig));
    setToast({
      text: `Banner actualizado (${newConfig.mediaType === 'video' ? 'Video corto' : 'Fotografía'}).`,
      type: 'success',
    });
  };

  const handleFichaSuccess = (ficha: FichaBienvenida) => {
    setToast({
      text: `Ficha de ${ficha.nombreCompleto} registrada exitosamente y enviada al módulo Primeros Pasos.`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      {/* Barra de navegación superior compacta y luminosa */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 md:px-8 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y título de marca */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/logo-cmv.png"
                alt="CMV Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                  CMV
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600" />
                <span className="text-[9.5px] font-bold text-slate-500 dark:text-gray-400">
                  Portal Pastoral
                </span>
              </div>
              <p className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Cristo Manantial de Vida
              </p>
            </div>
          </div>

          {/* Acciones principales compactas con botones cuadrados */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={14} />
              <span>NUEVO HERMANO</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Alternador de tema */}
            <ThemeToggle />

            {/* Menú de sesión */}
            <div className="hidden md:flex items-center gap-2 pl-1">
              <div className="text-right">
                <p className="text-xs font-bold leading-none capitalize">{user.name}</p>
                <p className="text-[9.5px] text-slate-400 dark:text-gray-400 font-semibold lowercase">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void logout().then(() => navigate('/login'))}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal expandido hacia los cuadros generales */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 space-y-3.5 sm:space-y-4">
        {/* Banner Principal con Imagen o Video, Lema Cursivo y Visión */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl bg-[#06122d]">
          {/* Fondo Multimedia: Imagen o Video Corto (7-10s) */}
          <div className="absolute inset-0 -z-0 overflow-hidden">
            {bannerConfig.mediaType === 'video' && bannerConfig.mediaUrl ? (
              <video
                key={bannerConfig.mediaUrl}
                src={bannerConfig.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />
            ) : (
              <img
                key={bannerConfig.mediaUrl}
                src={bannerConfig.mediaUrl || '/banner-hermanos.jpg'}
                alt="Comunidad CMV"
                className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
              />
            )}
            {/* Capa de textura fractal glass para una refracción luminosa integrada */}
            <div 
              className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: "url('/fractal-glass-bg.jpg')" }}
            />
            {/* Gradiente vibrante: azul marino oscuro a la izquierda, cian en el centro y esmeralda a la derecha */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06122d]/90 via-[#0284c7]/75 to-[#059669]/75 dark:from-[#050b1a]/95 dark:via-[#0369a1]/85 dark:to-[#047857]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.25)_0%,transparent_60%)]" />
          </div>

          {/* Contenido con Lema Cursivo, Visión en 3 Puntos y Botón Discreto Editar Banner */}
          <header className="relative z-10 w-full px-6 sm:px-10 md:px-12 pt-8 sm:pt-12 md:pt-14 pb-8 sm:pb-10 md:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-3 max-w-2xl">
              {/* Etiqueta superior */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-cyan-400/30 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="text-[#00dfa2]" size={13} />
                <span>PLATAFORMA PASTORAL CMV</span>
              </div>

              {/* Título de la sección */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md leading-none">
                Hermanos
              </h1>

              {/* Lema en cursiva manuscrita legible */}
              <div className="pt-0.5">
                <p className="font-cursive-legend text-2xl sm:text-3xl md:text-4xl text-cyan-200 tracking-wide drop-shadow-md leading-tight">
                  CMV, el manantial que nunca se seca
                </p>
              </div>

              {/* Tres puntos que representan la visión CMV (sin escribir 'visión CMV') */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-emerald-400/30 text-white shadow-sm hover:border-emerald-400/60 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#00dfa2] shadow-[0_0_8px_#00dfa2]" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-200">
                    Ganar
                  </span>
                </div>
                <span className="text-cyan-300/40 hidden sm:inline text-xs">•</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-cyan-400/30 text-white shadow-sm hover:border-cyan-400/60 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-200">
                    Discipular
                  </span>
                </div>
                <span className="text-cyan-300/40 hidden sm:inline text-xs">•</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-teal-400/30 text-white shadow-sm hover:border-teal-400/60 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4]" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-200">
                    Enviar
                  </span>
                </div>
              </div>
            </div>

            {/* Inscripción discreta para editar foto o video */}
            <div className="self-end md:self-end mt-2 md:mt-0">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 hover:border-cyan-400/60 text-white/80 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer active:scale-95 group"
                title="Editar fotografía o video del banner"
              >
                <Camera size={13} className="text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>Editar banner</span>
              </button>
            </div>
          </header>
        </div>

        {/* 1. SECCIÓN COMUNITARIA DESTACADA: PRÓXIMOS EVENTOS Y LO VIVIDO ESTA SEMANA (CARRUSELES DINÁMICOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
          {/* Próximos Eventos dinámico con fotos y videos cortos de 7s (2 columnas) */}
          <BentoProximosEventos onOpenEvents={() => navigate('/events')} />

          {/* Lo Vivido Esta Semana: carrusel dinámico multimedia que avanza solo (1 columna) */}
          <BentoLoVividoEstaSemana onOpenEvents={() => navigate('/events')} />
        </div>

        {/* 2. MÓDULOS PRINCIPALES DE GESTIÓN PASTORAL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
          {/* COLUMNA 1 (IZQUIERDA): CÉLULAS */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <BentoCardBienvenido />
          </div>

          {/* COLUMNA 2 & 3 (CENTRO): MÓDULOS DE GESTIÓN Y SEGUIMIENTO */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 h-full">
            {/* Tarjeta VISIÓN CMV: Padrón de Miembros Activos */}
            <BentoCardGeneral />

            {/* Tarjeta ESTADÍSTICAS: Pipeline pastoral */}
            <BentoCardSeguimiento />

            {/* Tarjeta ALTARES: Seguimiento de Altares en Red Apostólica */}
            <BentoCardAltares />

            {/* Tarjeta GRUPOS DE VIDA: Seguimiento de Grupos Abiertos y Contención */}
            <BentoCardGruposVida />
          </div>

          {/* COLUMNA 4 (DERECHA): ESCUELAS */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <BentoCardLiderazgo />
          </div>
        </div>
      </main>

      {/* Modal Ficha de Bienvenida (según 2da imagen de referencia) */}
      <FichaBienvenidaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFichaSuccess}
      />

      {/* Modal para Editar Banner (Fotografía o Video 7-10s) */}
      <BannerEditorModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onSave={handleSaveBannerConfig}
        currentConfig={bannerConfig}
      />

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          isVisible={Boolean(toast)}
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
