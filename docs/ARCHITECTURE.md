# Architecture

## Components

**React (client/)** – A Vite + React single page. A one-question-per-screen wizard collects mood, time, activity, and difficulty and calls `POST /api/adventure`. The result moves through preparation, commitment, closing, and Phone Away Mode. Three.js is the only 3D dependency and is loaded lazily.

**Node / Express (server/)** – A thin HTTP API.
- `routes/adventure.js` is a thin Express route; `routes/adventureHandler.js` validates input and maps errors to HTTP responses.
- `validation/adventureRequest.js` validates the incoming request.
- `validation/adventureSchema.js` holds the JSON schema sent to Ollama and validates the model's output.
- `services/adventureGenerator.js` builds the prompt, calls Ollama, parses and validates the result, and retries once.
- `services/modelJson.js` extracts a JSON object from model text.
- `prompts/adventurePrompt.js` holds the prompt text.
- `services/ollama.js` is the only file that talks to Ollama.
- `config.js` reads `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `PORT`.

**Ollama** – Runs on your machine and exposes a local HTTP API (default `http://localhost:11434`).

**Gemma 3** – The open-weight model (default `gemma3:4b`) that designs the adventure as structured JSON.

## Data flow

```
Browser (React)
   │  POST /api/adventure {mood, activity, duration, difficulty}
   ▼
Express route ── validate ──► 400 on bad input
   │
   ▼
adventureGenerator ── build prompt
   │
   ▼
ollama.js ── POST {OLLAMA_BASE_URL}/api/generate
   │
   ▼
Gemma 3 (local) ──► JSON text
   │
   ▼
parse + validate (retry once) ──► 502 if still unusable
   │
   ▼
{ success, adventure, model } ──► React field guide
```

In development, Vite proxies `/api` to the backend on port 3001. When the client is built, Express serves `client/dist` itself, including the PWA manifest and service worker.

## Client structure

```
client/src/
├── App.jsx                       screen switch driven by the journey reducer
├── state/
│   ├── journey.js                the state machine (one `screen` value, allowed actions per screen)
│   └── storage.js                localStorage: validated session + optional reflections
├── services/
│   ├── api.js                    request/response validation for local adventure generation
│   └── offline.js                service-worker registration and cache readiness checks
├── pages/Home.jsx                the personalization wizard
├── components/
│   ├── AdventureGuide.jsx        the field-guide view of the adventure
│   ├── commitment/               CommitmentScreen, RunawayButton, runawayMath (pure geometry)
│   ├── closing/                  ClosingScene (wrapper, fallback), OutdoorScene (Three.js, lazy),
│   │                             sceneBuilders (procedural meshes), sceneTimeline (pure choreography)
│   └── phone-away/               PhoneAwayMode, MissionCard, MissionTimer, timerModel (pure),
│                                 AdventureComplete
└── hooks/usePrefersReducedMotion.js
```

## Journey state machine

```
ADVENTURE (prepare) ──start──► COMMITMENT ──yes──► CLOSING ──continue──► INTRO ──begin──► MISSION ──last──► COMPLETE ──► HOME
    ▲                    │                                       │                 │
    └────── back ────────┘                       └── exit ───────┴────── exit ─────┘ (progress kept)
```

Each screen accepts only its own actions; anything else is ignored, so impossible combinations cannot occur. The generated adventure object is held in this state for the whole journey; **no screen after generation calls the backend or Gemma**.

## Lazy loading

`ClosingScene` is loaded with `React.lazy` only when the user says yes, and `OutdoorScene` (which imports `three`) is loaded from inside it only if WebGL is available. Production builds include and precache these lazy chunks so the prepared scene can load offline. The scene uses procedural geometry and a generated sky texture rather than external assets.

## Stage 4 offline support

The Vite build plugin emits a versioned service worker whose install step caches the root shell, manifest, icon, and all emitted bundle files. Because the 3D component and Three.js are emitted as build chunks, these are included even though they load lazily. Navigation is network-first with cached `/` as fallback; same-origin built assets are cache-first. `/api/` is excluded. The browser cache is checked by the Prepare screen against the active worker's real asset list.

Adventure and workflow state stay in `localStorage`; a timestamp-based optional timer is stored per local adventure and mission. The production offline journey uses this saved object and does not call the generation endpoint. The app cannot make the backend or Ollama available offline for generating another adventure. Browser storage can be cleared or evicted and is not encrypted.
