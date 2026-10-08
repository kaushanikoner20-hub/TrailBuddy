# Testing

This file records only what has actually been run. Unchecked items have **not** been verified.

## Automated tests (`npm test`)
- [x] Input validation (`server/validation.test.js`, 7 tests): valid input, normalization, bad activity/difficulty/duration, missing body, multiple errors.
- [x] Ollama service error handling (`server/ollama.test.js`, 7 tests) against a local stub HTTP server: success parsing, request shape (model, `stream: false`), 404 → model not found, 500, malformed/empty response, timeout, connection refused. **These use a stub server, not a real model.**
- Result: 14/14 passed (Node 22, in a sandbox without Ollama).

## Frontend
- [️✅] Client source bundles without errors (checked with esbuild in a sandbox).
- [️✅] `npm run dev:client` starts under Vite
- [️✅] UI renders and is usable on desktop and mobile widths
- [️✅] Loading state appears during generation
- [️✅] Error notice appears and "Try again" works

## Environment (on the developer machine)
- [️✅] Ollama installed and running (`ollama list` worked)
- [️✅] `gemma3:4b` installed (appeared in `ollama list`)
- [✅] `ollama run gemma3:4b "..."` returns a response

## End to end with real Gemma
- [✅] `npm run dev:server` starts
- [️✅] Frontend reaches backend
- [️✅] Backend reaches Ollama and Gemma returns a real adventure displayed in the UI
- [️✅] Invalid input rejected via the live API (`curl` with a bad body returns 400)
- [️✅] Wrong `OLLAMA_MODEL` shows the model-unavailable message
- [️✅] Stopping Ollama shows the can't-reach-model message

## Other
- [ ] `docker compose up --build`
- [ ] GitHub Actions workflow
- [ ] `.env` confirmed ignored by git (`git status` after creating `.env`)