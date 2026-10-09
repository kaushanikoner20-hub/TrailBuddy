import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), {
    name: 'trailbuddy-offline-worker',
    generateBundle(_options, bundle) {
      const assets = [...Object.keys(bundle).filter((name) => name !== 'sw.js').map((name) => `/${name}`), '/icons/trailbuddy.svg'];
      const cacheName = `trailbuddy-shell-${Object.keys(bundle).sort().join('-').split('').reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7).toString(36)}`;
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE=${JSON.stringify(cacheName)};\nconst ASSETS=${JSON.stringify(['/', '/manifest.webmanifest', ...assets])};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));\nself.addEventListener('message',event=>{if(event.data?.type==='CHECK_OFFLINE_ASSETS')event.ports[0]?.postMessage({assets:ASSETS,cacheName:CACHE});});\nself.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put('/',response.clone()));return response;}).catch(()=>caches.match('/').then(response=>response||Response.error())));return;}event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));});`,
      });
    },
  }],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
});
