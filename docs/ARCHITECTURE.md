# Architecture

## Components

**React (client/)** – A Vite + React single page. A one-question-per-screen wizard collects mood, time, activity, and difficulty, calls `POST /api/adventure`, and shows a loading state, the generated adventure as a field guide, or an error.

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
Gemma 3 (local) ──► JSON text
   │
   ▼
parse + validate (retry once) ──► 502 if still unusable
   │
   ▼
{ success, adventure, model } ──► React field guide
```

In development, Vite proxies `/api` to the backend on port 3001. When the client is built, Express serves `client/dist` itself.