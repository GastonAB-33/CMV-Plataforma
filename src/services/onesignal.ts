import { User } from '../types';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
  }
}

export const ONESIGNAL_APP_ID =
  (import.meta.env.VITE_ONESIGNAL_APP_ID as string) || '8d439350-4f46-48fb-9efc-968eb23cd114';

let isInitialized = false;

/**
 * Inicializa el SDK Web de OneSignal (v16).
 * Se ejecuta de manera segura en el cliente (browser).
 */
export const initOneSignal = (): void => {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  isInitialized = true;
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // Usamos controles e interfaz integrada en la app
        },
      });
    } catch (error) {
      console.warn('[OneSignal] Error al inicializar:', error);
    }
  });
};

/**
 * Asocia al usuario autenticado con OneSignal y agrega etiquetas (roles, célula).
 * Esto permite enviar notificaciones segmentadas por rol o célula.
 */
export const setOneSignalUser = (user: User): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      if (user.id && user.id !== 'u-local-fallback') {
        await OneSignal.login(user.id);
      }

      await OneSignal.User.addTags({
        role: user.role,
        primary_cell: user.primaryCell || 'sin_celula',
        user_name: user.name || '',
      });
    } catch (error) {
      console.warn('[OneSignal] Error al asociar usuario:', error);
    }
  });
};

/**
 * Cierra la sesión del usuario en OneSignal al hacer logout.
 */
export const logoutOneSignal = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.logout();
    } catch (error) {
      console.warn('[OneSignal] Error al desloguear usuario:', error);
    }
  });
};

/**
 * Solicita permisos de notificación al usuario en el navegador/dispositivo.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
        const granted = Boolean(OneSignal.Notifications.permission);
        resolve(granted);
      } catch (error) {
        console.warn('[OneSignal] Error al solicitar permisos:', error);
        resolve(false);
      }
    });
  });
};

/**
 * Consulta el estado actual de los permisos de notificación.
 */
export const getNotificationPermissionState = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};
