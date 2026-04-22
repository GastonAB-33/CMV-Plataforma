export const registerServiceWorker = () => {
  if (import.meta.env.DEV) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignorar errores de registro para no interrumpir la carga de la app.
    });
  });
};
