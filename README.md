# 🌿 TrailBuddy

**An AI designed to make itself unnecessary.**

> What if the best thing an AI could do for you was make you stop looking at it?

TrailBuddy is a local-first outdoor adventure generator. You tell it how you want to feel and how much time you have. A Gemma 3 model running on your own computer through Ollama designs a short, sensory, phone-free adventure. You read it once, then go outside. The AI doesn't need to follow you.

> **Current stage: Stage 3 — The Exit Experience & Phone Away Mode.** Personalized Gemma adventures (Stage 2) now lead into a commitment screen, a 3D closing scene, and a minimal Phone Away Mode. Offline/PWA support is **not built yet**. See [Current limitations](#current-limitations) and [docs/TESTING.md](docs/TESTING.md) for exactly what has been verified.

## Why TrailBuddy?

People often want to spend time outdoors but stay tied to their screens. TrailBuddy uses AI to prepare a personalized outdoor experience, then encourages you to put the phone away and experience the real world.

## What it does now

**Stage 2: the adventure**
1. You pick a **mood**, **time** (15–90 min), **activity**, and **how adventurous**.
2. Gemma acts as an *Outdoor Experience Designer* and returns structured **sensory missions** (hearing, vision, touch, memory, curiosity, movement).
3. The server validates the JSON (and retries once if it is unusable) before the app shows it as a field guide.

**Stage 3: the exit**
1. **START MY ADVENTURE** opens a full-screen commitment screen: *ARE YOU GOING OUT?*
2. The **NO, I'M NOT** button playfully hops away from a mouse a few times, then settles. It never reacts to touch or keyboard, respects reduced motion, and can always be clicked.
3. **YES, I'M GOING** opens a 3D closing scene (Three.js): a bird takes off from a branch and flies away while *LET'S MEET OUTSIDE NOW* appears. There is a skip button and a plain fallback if WebGL is unavailable.
4. **Phone Away Mode** shows the real Gemma-generated missions one at a time, with an optional timer, pause, and exit. A calm completion screen offers an optional reflection saved only in your browser.

> We wanted the final interaction with TrailBuddy to feel like an exit, not another screen to consume.

Example request to `POST /api/adventure` (unchanged in Stage 3; entering Phone Away Mode makes no AI request):

```json
{ "mood": "calm", "duration": 30, "activity": "walk", "difficulty": "gentle" }
```

Response shape (the content comes from Gemma and varies):

```json
{
  "success": true,
  "model": "gemma3:4b",
  "adventure": {
    "title": "…", "tagline": "…", "duration": 30, "mood": "calm",
    "activity": "walk", "difficulty": "gentle", "phone_free": true,
    "intro": "…",
    "missions": [{ "id": 1, "type": "hearing", "title": "…", "duration": 5, "instruction": "…" }],
    "closing": "…"
  }
}
```

## Open AI approach

- [Gemma 3](https://ai.google.dev/gemma) is an open-weight model.
- [Ollama](https://ollama.com) runs Gemma locally on your computer.
- TrailBuddy does not use a cloud LLM API. Your choices are sent to `localhost`, not to an AI provider.
- If the local model is unavailable, the app shows an error. It never substitutes a canned adventure.

## Architecture

```
User
 ↓
React (Vite)
 ↓
Node / Express
 ↓
Ollama
 ↓
Gemma 3
 ↓
Validated adventure
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup

**Prerequisites:** Node.js 20.12 or newer, npm, and [Ollama](https://ollama.com/download).

1. Install Ollama and make sure it is running.
2. Install Gemma 3: `ollama pull gemma3:4b`
3. Verify: `ollama run gemma3:4b "Say hello in one sentence"`
4. Install dependencies: `npm run install:all`
5. Configure (optional, defaults match `.env.example`): `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
6. Start the backend: `npm run dev:server`
7. Start the frontend in a second terminal: `npm run dev:client`

Open <http://localhost:5173>. More detail in [docs/SETUP.md](docs/SETUP.md). Run tests with `npm test`.

## Current limitations

- **Offline outdoor mode is not implemented** (planned for Stage 4). Generating an adventure needs Ollama running locally. After generation, Phone Away Mode needs no AI, but the app is not a PWA: the page, scripts, and the lazily loaded 3D scene still come from the dev/web server, so a reload with no server will not work.
- **Only the current adventure and your progress are kept** (in this browser's `localStorage`) so a reload doesn't lose them. There is no history, account, or sync.
- **The 3D closing scene is procedural** (simple low-poly trees and a stylized bird, no imported models). It needs WebGL; without it, or if it fails to load, a plain non-3D backdrop with the same text is shown instead.
- **Timers and completion are self-reported.** The timer measures timer time only. TrailBuddy cannot know whether you were outside, and makes no claim about screen time.
- Gemma is a small local model. Adventures are checked for structure and timing, **not** for real-world safety or quality. Use common sense outdoors.
- There is no browser back-button routing between screens.
- Docker support is minimal and untested; Ollama and Gemma run on your host.

## Third-party software

- [Three.js](https://threejs.org) (MIT license) renders the closing scene. It is the only 3D dependency. There are no bundled 3D models, textures, or fonts, so no other asset licenses apply.

## Documentation

[Project overview](docs/PROJECT_OVERVIEW.md) · [Architecture](docs/ARCHITECTURE.md) · [How it works](docs/HOW_IT_WORKS.md) · [Open AI](docs/OPEN_AI.md) · [Offline mode](docs/OFFLINE_MODE.md) · [Privacy](docs/PRIVACY.md) · [Setup](docs/SETUP.md) · [Demo](docs/DEMO.md) · [Design decisions](docs/DESIGN_DECISIONS.md) · [Testing](docs/TESTING.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)