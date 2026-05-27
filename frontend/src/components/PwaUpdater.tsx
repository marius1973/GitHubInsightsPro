import { useEffect, useState } from 'react';

/**
 * Banner que notifica al usuario:
 *  - Cuando hay una nueva versión disponible (y ofrece recargar)
 *  - Cuando pierde conexión a internet
 *
 * Usa importación dinámica para no afectar el bundle cuando PWA está desactivado.
 */
export function PwaUpdater() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let active = true;
    // Importa el módulo virtual registrado por vite-plugin-pwa
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (!active) return;
        const update = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            // Instalación inicial completada
            console.info('[PWA] offline-ready');
          },
        });
        setUpdateSW(() => update);
      })
      .catch(() => {
        // PWA no está activo (ej: modo desarrollo)
      });

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      active = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!needRefresh && !offline) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-[60] flex justify-center pointer-events-none">
      {needRefresh && (
        <div className="pointer-events-auto bg-blue-600 text-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 max-w-md mx-2">
          <span className="text-sm">A new version is available.</span>
          <button
            type="button"
            onClick={() => updateSW?.(true)}
            className="bg-white text-blue-600 font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-blue-50"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss"
            className="text-white/80 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      {!needRefresh && offline && (
        <div className="pointer-events-auto bg-amber-500 text-white shadow-lg rounded-xl px-4 py-2 text-sm">
          You're offline — showing cached data
        </div>
      )}
    </div>
  );
}
