# Architecture

## Components

**React (client/)** – A Vite + React single page. It collects the three inputs, calls `POST /api/adventure`, and shows a loading state, the generated adventure, or an error.

**Node / Express (server/)** – A thin HTTP API.
- `routes/adventure.js` validates input (via `validation.js`) and maps errors to HTTP responses.
- `services/adventureGenerator.js` builds the prompt and calls Ollama.
- `prompts/adventurePrompt.js` holds the prompt text.
- `services/ollama.js` is the only file that talks to Ollama.
- `config.js` reads `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `PORT`.

**Ollama** – Runs on your machine and exposes a local HTTP API (default `http://localhost:11434`).

**Gemma 3** – The open-weight model (default `gemma3:4b`) that generates the adventure text.

## Data flow

```
Browser (React)
   │  POST /api/adventure {activity, duration, difficulty}
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
Gemma 3 (local) ──► text
   │
   ▼
{ adventure, model } ──► React card
```

In development, Vite proxies `/api` to the backend on port 3001. When the client is built, Express serves `client/dist` itself.