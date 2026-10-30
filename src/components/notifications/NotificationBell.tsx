import React, { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Check, Info } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionState } from '../../services/onesignal';

export const NotificationBell: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as any).standalone === true));

  useEffect(() => {
    void getNotificationPermissionState().then((state) => {
      setPermission(state);
    });
  }, []);

  const handleToggleNotifications = async () => {
    // Si es iOS y no está instalado en la pantalla de inicio, Apple no permite activar notificaciones
    if (isIOS && !isStandalone) {
      setShowIOSHelp(true);
      return;
    }

    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
    } catch {
      // Ignorar errores
    } finally {
      setIsLoading(false);
    }
  };

  if (permission === 'unsupported') {
    return null;
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleToggleNotifications}
          disabled={isLoading}
          title={
            permission === 'granted'
              ? 'Notificaciones push activadas'
              : permission === 'denied'
                ? 'Notificaciones bloqueadas en tu navegador'
                : 'Activar notificaciones push'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            permission === 'granted'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : permission === 'denied'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm hover:scale-[1.02]'
          }`}
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : permission === 'granted' ? (
            <>
              <Check size={14} />
              <span className="hidden sm:inline">Notificaciones al día</span>
            </>
          ) : permission === 'denied' ? (
            <>
              <BellOff size={14} />
              <span className="hidden sm:inline">Notificaciones bloqueadas</span>
            </>
          ) : (
            <>
              <BellRing size={14} className="animate-bounce" />
              <span>Activar Notificaciones</span>
            </>
          )}
        </button>
      </div>

      {/* Modal explicativo para iOS cuando no está agregado a inicio */}
      {showIOSHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141414] p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Info size={24} />
            </div>

            <h3 className="text-lg font-bold mb-2">Requisito para iPhone / iPad</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed mb-4">
              Apple exige que la aplicación esté agregada a tu pantalla de inicio para poder enviarte notificaciones push:
            </p>

            <ol className="text-xs text-slate-600 dark:text-gray-300 space-y-2 mb-6 list-decimal list-inside bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
              <li>Tocá el botón <strong>Compartir</strong> (ícono cuadrado con flecha arriba) en Safari.</li>
              <li>Elegí <strong>«Agregar a pantalla de inicio»</strong>.</li>
              <li>Abrí la app desde tu pantalla de inicio y tocá <strong>Activar Notificaciones</strong>.</li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSHelp(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
