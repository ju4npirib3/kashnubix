'use client';

import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
      // Check for updates immediately on every page load
      registration.update().catch(() => {});

      // Auto-apply update as soon as the new SW finishes installing
      registration.addEventListener('updatefound', () => {
        const newSW = registration.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed') {
            // Skip waiting immediately — no user prompt needed
            newSW.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // If a new SW was already waiting when the page loaded, activate it now
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });

    // When the new SW takes control, reload to get the fresh code
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  return null;
}
