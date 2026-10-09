# Offline mode

**Full offline outdoor mode is planned for Stage 4.**

The current Stage 1 app is not an offline app. It needs the browser, the Express server, and Ollama running on your computer to generate an adventure, and it does not save adventures.

## Intended future flow

```
Generate while connected
 ↓
Save locally
 ↓
Disconnect
 ↓
Go outside
 ↓
Complete adventure
```

None of the saving, installable-app, or outdoor-mode behavior above exists yet.

## What Stage 3 prepared (but is not offline support)

- After generation, **Phone Away Mode needs no AI and makes no network request**: it runs from the adventure held in the page and a small `localStorage` copy.
- Progress survives a reload, but the page, scripts, and the lazily loaded 3D scene still come from the server. With no server, a reload won't work.
- Not done yet: a service worker, precaching the app shell and the 3D chunk, and an installable PWA. Those are Stage 4.