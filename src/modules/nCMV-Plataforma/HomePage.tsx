import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Sparkles,
  LogOut,
  Camera,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeProvider';
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

  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (EXACTA A IMAGEN 1) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y título: Logo CMV más grande con fondo azul inglés #2C5A71 y título PLATAFORMA VISIÓN CMV */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#2C5A71] p-2 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/logo-cmv.png"
                alt="CMV Logo"
                className="w-full h-full object-contain filter drop-shadow brightness-110"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#00dfa2] dark:text-emerald-400 block leading-tight">
                CMV
              </span>
              <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate sm:whitespace-normal">
                PLATAFORMA VISIÓN CMV
              </h2>
            </div>
          </div>

          {/* Botón Hamburguesa exacto a Imagen 1 */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#151515] dark:hover:bg-[#202020] border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Menú principal"
              title="Menú"
            >
              <Menu size={22} className="stroke-[2.5]" />
            </button>

            {/* Menú desplegable con información de usuario y selección de tema */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white dark:bg-[#121822] border border-slate-200 dark:border-white/15 p-3 shadow-2xl z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white capitalize">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold lowercase">
                    {user.role}
                  </p>
                </div>

                {/* Opción de selección de tema Oscuro y Claro */}
                <div className="py-1 border-b border-slate-100 dark:border-white/10 mb-2">
                  <button
                    type="button"
                    onClick={() => toggleTheme()}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-cyan-400" />}
                      <span>Tema</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white">
                      {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void logout().then(() => navigate('/login'))}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 space-y-3.5 sm:space-y-4 w-full max-w-full overflow-x-hidden">
        {/* 2. SUB-BARRA DE HERRAMIENTAS: PLATAFORMA VISIÓN CMV / EL MANANTIAL QUE NUNCA SE SECA + BOTÓN NUEVO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1 w-full max-w-full">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#00dfa2] dark:text-emerald-400">
                CMV
              </span>
              <span className="text-slate-400 dark:text-gray-500">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-300">
                Plataforma Visión CMV
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wide text-slate-900 dark:text-white leading-tight mt-0.5 break-words">
              EL MANANTIAL QUE NUNCA SE SECA
            </h1>
          </div>

          {/* Botón NUEVO exacto a imagen de referencia con gradiente esmeralda a azul inglés */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#0d9488] via-[#155e75] to-[#2C5A71] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              <span>NUEVO</span>
            </button>
          </div>
        </div>

        {/* 3. BANNER PRINCIPAL CON IMAGEN O VIDEO, DEGRADÉ RESTAURADO, LEMA EYESOME SCRIPT CENTRALIZADO Y REDUCIDO */}
        <div className="relative w-full max-w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl bg-[#06122d]">
          {/* Fondo Multimedia */}
          <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
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
            {/* Gradiente vibrante exacto restaurado: azul marino oscuro a la izquierda, cian en el centro y esmeralda a la derecha */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06122d]/90 via-[#0284c7]/75 to-[#059669]/75 dark:from-[#050b1a]/95 dark:via-[#0369a1]/85 dark:to-[#047857]/80 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.25)_0%,transparent_60%)] pointer-events-none" />
          </div>

          {/* Contenido con Lema Cursivo Eyesome Script CENTRALIZADO y 4 Pastillas */}
          <div className="relative z-10 w-full max-w-full px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-14 flex flex-col items-center justify-center text-center gap-4 sm:gap-5 overflow-hidden">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              {/* Lema en 4 líneas exactas a imagen de referencia con 'Espíritu Santo.' junto abajo */}
              <div className="font-cursive-motto text-[17px] min-[380px]:text-xl sm:text-2xl md:text-3xl lg:text-[34px] text-white tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] leading-[1.3] text-center max-w-2xl mx-auto flex flex-col items-center">
                <span>Llevar las aguas de este manantial a</span>
                <span>cada hogar , ciudad , nación hasta lo</span>
                <span>último de la tierra en el poder del</span>
                <span className="whitespace-nowrap">Espíritu Santo.</span>
              </div>

              {/* 4 Pastillas de Visión: más pequeñas y posicionadas más abajo para destacar el lema */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mt-5 sm:mt-7 pt-2 w-full max-w-xl mx-auto">
                {/* GANAR */}
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#061520]/85 border border-emerald-500/35 text-white shadow-sm backdrop-blur-md shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00dfa2] shadow-[0_0_8px_#00dfa2] shrink-0" />
                  <span className="text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                    GANAR
                  </span>
                </div>

                {/* CONSOLIDAR */}
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#061520]/85 border border-cyan-500/35 text-white shadow-sm backdrop-blur-md shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00d2ff] shadow-[0_0_8px_#00d2ff] shrink-0" />
                  <span className="text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                    CONSOLIDAR
                  </span>
                </div>

                {/* DISCIPULAR */}
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#061520]/85 border border-cyan-500/35 text-white shadow-sm backdrop-blur-md shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] shrink-0" />
                  <span className="text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                    DISCIPULAR
                  </span>
                </div>

                {/* ENVIAR */}
                <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#061520]/85 border border-teal-500/35 text-white shadow-sm backdrop-blur-md shrink-0">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_#2dd4bf] shrink-0" />
                  <span className="text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                    ENVIAR
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de editar banner oculto según solicitud del usuario */}
          </div>
        </div>

        {/* 1. SECCIÓN COMUNITARIA DESTACADA: PRÓXIMOS EVENTOS Y LO VIVIDO ESTA SEMANA (CARRUSELES DINÁMICOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch w-full max-w-full">
          {/* Próximos Eventos dinámico con fotos y videos cortos de 7s (2 columnas) */}
          <BentoProximosEventos onOpenEvents={() => navigate('/events?tab=proximos')} />

          {/* Lo Vivido Esta Semana: carrusel dinámico multimedia que avanza solo (1 columna) */}
          <BentoLoVividoEstaSemana onOpenEvents={() => navigate('/events?tab=vivido')} />
        </div>

        {/* 2. MÓDULOS DE GESTIÓN PASTORAL Y COMUNITARIA (ORDEN ESTRICTO: LÍNEA DE VIDA -> ALTARES -> GRUPOS DE VIDA -> CÉLULA -> ESCUELA -> ESTADÍSTICA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch w-full max-w-full">
          {/* 1. LÍNEA DE VIDA */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardGeneral />
          </div>

          {/* 2. ALTARES */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardAltares />
          </div>

          {/* 3. GRUPOS DE VIDA */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardGruposVida />
          </div>

          {/* 4. CÉLULAS */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardBienvenido />
          </div>

          {/* 5. ESCUELAS */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardLiderazgo />
          </div>

          {/* 6. ESTADÍSTICAS */}
          <div className="w-full max-w-full min-w-0 flex flex-col h-full">
            <BentoCardSeguimiento />
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
