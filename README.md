# 🌿 TrailBuddy

**An AI designed to make itself unnecessary.**

> What if the best thing an AI could do for you was make you stop looking at it?

TrailBuddy is a local-first outdoor adventure generator. You tell it how you want to feel and how much time you have. A Gemma 3 model running on your own computer through Ollama designs a short, sensory, phone-free adventure. You read it once, then go outside. The AI doesn't need to follow you.

> **Current stage: Stage 2 — AI Adventure Generator.** The personalization flow, structured Gemma output, validation, and field-guide UI work. Phone Away Mode, the closing scene, and offline mode are **not built yet**. See [Current limitations](#current-limitations).

## Why TrailBuddy?

People often want to spend time outdoors but stay tied to their screens. TrailBuddy uses AI to prepare a personalized outdoor experience, then encourages you to put the phone away and experience the real world.

## What it does now (Stage 2)

1. You pick a **mood** (Calm, Energized, Clear my head, Curious, Creative), **time** (15–90 min), **activity**, and **how adventurous**.
2. Gemma acts as an *Outdoor Experience Designer* and returns a structured adventure made of **sensory missions** (hearing, vision, touch, memory, curiosity, movement).
3. The server validates the model's JSON (and retries once if it is unusable) before the app shows it as a field guide.

Example request to `POST /api/adventure`:

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

## Planned: the Stage 3 experience (not built)

```
Adventure generated
 ↓
"ARE YOU GOING OUT?"
 ↓
YES / NO
 ↓
Playful "NO" button interaction
 ↓
3D outdoor closing scene
 ↓
Bird flies away
 ↓
"LET'S MEET OUTSIDE NOW"
 ↓
Phone Away Mode
 ↓
User puts phone away
```

The **Start my adventure** button in the current UI only shows a note that this is not built yet.

## Current limitations

- **Phone Away Mode, the closing scene, and the "ARE YOU GOING OUT?" flow are not implemented** (planned for Stage 3).
- **Offline outdoor mode is not implemented** (planned for Stage 4). The app needs Ollama running locally to generate an adventure, and does not yet save adventures.
- **No local persistence yet.** Adventures are shown on screen only.
- Gemma is a small local model. Adventures are checked for structure and timing, **not** for real-world safety or quality. Use common sense outdoors.
- Generation can take a while on modest hardware, especially the first run after the model loads.
- Docker support is minimal and untested; Ollama and Gemma run on your host.

## Documentation

[Project overview](docs/PROJECT_OVERVIEW.md) · [Architecture](docs/ARCHITECTURE.md) · [How it works](docs/HOW_IT_WORKS.md) · [Open AI](docs/OPEN_AI.md) · [Offline mode](docs/OFFLINE_MODE.md) · [Privacy](docs/PRIVACY.md) · [Setup](docs/SETUP.md) · [Demo](docs/DEMO.md) · [Design decisions](docs/DESIGN_DECISIONS.md) · [Testing](docs/TESTING.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)