export async function registerOfflineWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch {
    return null;
  }
}

function workerAssetList(worker) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => reject(new Error('The offline worker did not respond.')), 3000);
    channel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      resolve(event.data ?? { assets: [], cacheName: null });
    };
    worker.postMessage({ type: 'CHECK_OFFLINE_ASSETS' }, [channel.port2]);
  });
}

export async function checkOfflineReadiness({ store, hasAdventure }) {
  const results = [
    { label: 'Adventure saved on this device', ready: hasAdventure },
    { label: 'Mission instructions available locally', ready: hasAdventure },
  ];
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    return { ready: false, results: [...results, { label: 'Offline app shell and scene assets cached', ready: false, detail: 'Use the installed production build in a browser with service worker support.' }] };
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const worker = navigator.serviceWorker.controller ?? registration?.active;
    if (!worker) throw new Error('The offline app has not been installed into this browser yet.');
    const { assets, cacheName } = await workerAssetList(worker);
    const cache = cacheName ? await caches.open(cacheName) : null;
    if (!cache) throw new Error('The application shell cache is missing.');
    const sceneAssets = assets.filter((path) => /\/(?:ClosingScene|OutdoorScene)-/.test(path));
    const checkAssets = async (paths) => {
      const missing = [];
      for (const path of paths) if (!await cache.match(new URL(path, location.origin).href)) missing.push(path);
      return missing;
    };
    const appAssets = assets.filter((path) => !sceneAssets.includes(path) && !['/', '/manifest.webmanifest', '/icons/trailbuddy.svg'].includes(path));
    const [missingApp, missingScene] = await Promise.all([checkAssets(appAssets), checkAssets(sceneAssets)]);
    const checks = [
      { label: 'Phone Away Mode assets available locally', ready: missingApp.length === 0, detail: missingApp.length ? `Missing ${missingApp.length} app asset(s). Reopen the app online and retry.` : undefined },
      { label: '3D closing scene assets available locally', ready: sceneAssets.length > 0 && missingScene.length === 0, detail: !sceneAssets.length || missingScene.length ? 'The closing scene bundle is missing. Reopen the production app online and retry.' : undefined },
      { label: 'Offline application shell cached', ready: Boolean(await cache.match(new URL('/', location.origin).href)), detail: 'Reopen the app online and retry if missing.' },
    ];
    return { ready: results.every((item) => item.ready) && checks.every((item) => item.ready), results: [...results, ...checks] };
  } catch (error) {
    return { ready: false, results: [...results, { label: 'Offline app shell and scene assets cached', ready: false, detail: error.message || 'Cache storage is unavailable.' }] };
  }
}
