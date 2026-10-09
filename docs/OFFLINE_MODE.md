# Offline mode

## What offline means

Adventure generation still needs the configured Express backend and local Ollama/Gemma. Once generated, an adventure can be saved and prepared in the browser. The production service worker precaches the application shell and every built client asset, including the lazy Three.js scene chunk. Phone Away Mode reads the saved adventure and stores mission progress locally; it makes no AI or adventure API request.

## Prepared offline journey

```
LOCAL GEMMA + OLLAMA → GENERATE ADVENTURE → SAVE ADVENTURE LOCALLY
→ CACHE REQUIRED APP ASSETS → CHECK OFFLINE READINESS → DISCONNECT IF DESIRED
→ PHONE AWAY MODE → MISSIONS + LOCAL PROGRESS → OPTIONAL LOCAL REFLECTION
```

After generation, use **PREPARE MY ADVENTURE**. Readiness checks the saved adventure and mission data, the active service worker's build asset list, and each required response in that build's cache. A failed check reports missing items and can be retried. The production worker precaches the assets during installation; this button verifies the cache rather than downloading files. Preparation does not turn off the network and does not check your physical location.

## Cache behavior

- The service worker is registered in production builds. Install precaches the root shell, manifest, icon, and emitted client assets (including hashed JavaScript and CSS chunks). Install fails as a unit if a required resource cannot be cached.
- Same-origin static assets use cache-first. Navigations use network-first with the cached root as fallback. `/api/` calls are excluded from caching.
- New builds get a separate versioned cache. Older caches are retained so an open older page can still request its own hashed chunks; browser storage can eventually be evicted.
- `client/public/manifest.webmanifest` describes the app. Installation is optional and depends on browser support.

## Local data and limits

- The active adventure, original structured adventure object, local ID, timestamp, prepared flag, workflow screen, current mission index, and completed/skipped IDs are in `localStorage` (`trailbuddy.session.v1`).
- Mission timer state is saved per adventure and mission in localStorage. It uses timestamps: a running timer includes time passed while the page is suspended or closed; a paused timer does not. Timer completion never marks a mission complete.
- Reflections are stored only in localStorage and are not uploaded or sent to Gemma.
- Browser storage is not encrypted and is not guaranteed to persist permanently. It may be blocked, cleared, or evicted. The UI handles failures, but a device/browser reset can lose progress.
- A service worker cannot provide Ollama or Express if they are stopped. Generation therefore requires the configured local backend and Ollama/Gemma. `navigator.onLine` is advisory and does not prove a specific server is reachable.
- Offline navigation, storage, and installation vary by browser. Use the production build served over localhost or HTTPS; service workers are generally unavailable on ordinary insecure origins.

## Test the offline journey

1. Build and serve the production client (`npm run build`, then `npm start`) with the configured backend and Ollama available for generation.
2. Generate an adventure and press **PREPARE MY ADVENTURE**. Confirm each cache check passes.
3. In browser DevTools, enable Offline and reload the page. Confirm the saved adventure returns.
4. Open the commitment screen, continue through the closing scene, and complete missions. Verify the timer and progress after refresh.
5. Save a reflection and verify it remains in browser storage. Inspect Network: `/api/adventure` should only have been called during generation.

The bundled 3D scene is made from procedural Three.js geometry, sky texture, and animation code; it loads no external models, images, fonts, or animation files. If WebGL is missing or fails, the existing CSS fallback is used.
