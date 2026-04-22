import { Download, Share2, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  const userAgent = useMemo(() => window.navigator.userAgent.toLowerCase(), []);
  const isIos = useMemo(() => /iphone|ipad|ipod/i.test(userAgent), [userAgent]);
  const isAndroid = useMemo(() => /android/i.test(userAgent), [userAgent]);
  const isChromeLike = useMemo(() => /chrome|chromium|crios|edg|brave/i.test(userAgent), [userAgent]);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosGuide(false);
      setShowAndroidGuide(false);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => {
      setIsInstalled(isStandaloneMode());
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    mediaQuery.addEventListener('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      mediaQuery.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
        <Smartphone size={14} />
        App instalada en este dispositivo
      </div>
    );
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setShowIosGuide(false);
      setShowAndroidGuide(false);
      return;
    }

    if (isIos) {
      setShowIosGuide((prev) => !prev);
      setShowAndroidGuide(false);
      return;
    }

    setShowIosGuide(false);
    setShowAndroidGuide(true);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          void handleInstall();
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-[#c5a059]/50 bg-[#c5a059]/15 px-4 py-2 text-xs uppercase tracking-wider font-black text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
      >
        {deferredPrompt ? <Download size={14} /> : <Share2 size={14} />}
        {deferredPrompt ? 'Descargar app' : isIos ? 'Instalar en iPhone/iPad' : 'Instalar app'}
      </button>

      {showIosGuide && (
        <p className="text-xs text-slate-500 dark:text-gray-300 max-w-xl">
          En iOS: abre el menu compartir <Share2 size={12} className="inline" /> y elige <span className="font-semibold">"Agregar a pantalla de inicio"</span>.
        </p>
      )}

      {showAndroidGuide && (
        <p className="text-xs text-slate-500 dark:text-gray-300 max-w-xl">
          {isAndroid
            ? isChromeLike
              ? 'En Android: abre el menu del navegador (⋮) y toca "Instalar app" o "Agregar a pantalla de inicio".'
              : 'Para instalar en Android, abre esta web en Chrome y usa el menu (⋮) > "Instalar app".'
            : 'La instalacion PWA funciona en navegadores compatibles (Chrome/Edge). Si no aparece el popup, usa el menu del navegador y selecciona "Instalar app".'}
        </p>
      )}
    </div>
  );
};
