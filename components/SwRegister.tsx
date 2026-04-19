'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwRegister() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Force the browser to check for a new SW immediately on every page load
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
      setReg(registration);

      // Immediately check for updates (bypasses HTTP cache)
      registration.update().catch(() => {});

      // New SW found while page is open
      registration.addEventListener('updatefound', () => {
        const newSW = registration.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      });

      // If a new SW was already waiting when the page loaded
      if (registration.waiting && navigator.serviceWorker.controller) {
        setNeedRefresh(true);
      }
    });

    // When the new SW takes control, reload to apply the update
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  async function handleUpdate() {
    // Clear all caches first, then tell the waiting SW to take over
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setNeedRefresh(false);
  }

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto z-[200] bg-neutral-900 dark:bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        >
          <span className="text-xl flex-shrink-0">🆕</span>
          <p className="flex-1 text-sm font-semibold text-white dark:text-neutral-900 leading-tight">
            Nueva versión disponible
          </p>
          <button
            onClick={handleUpdate}
            className="px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-xl flex-shrink-0 active:scale-95 transition-transform"
          >
            Actualizar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
