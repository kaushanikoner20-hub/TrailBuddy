# Testing

This file records only what has actually been run. Unchecked items have **not** been verified.

## Automated tests (`npm test`)
Result in a sandbox without Ollama: 35 tests, 35 passed (Node 22).

- [x] Request validation (`validation/adventureRequest.test.js`): valid input, normalization, every option accepted, Stage 1 words still accepted, missing mood, invalid mood/activity/difficulty, invalid durations, missing body.
- [x] Model output validation (`validation/adventureSchema.test.js`): good output, non-objects, missing text, too few/many missions, bad mission fields, durations that don't fit the requested time.
- [x] JSON extraction (`services/modelJson.test.js`): clean JSON, code fences, extra words, malformed output.
- [x] Request handler against a stub Ollama server (`routes/adventureHandler.test.js`): 400 on bad input, 200 on valid output, fenced output, retry after malformed output, 502 after two unusable outputs, 503 model missing (not retried), 504 timeout, 503 Ollama down.
- [x] Ollama service error handling (`ollama.test.js`).

**These tests use a stub server, not a real model.** They test our parsing, validation, and error handling, not the quality of Gemma's output.

## Frontend
- [x] Source bundles without errors (esbuild, sandbox).
- [x] In a headless browser with a **stubbed API** (test-only; the app contains no fake responses): mood, duration, activity, and difficulty selection; the request body sent was `{"mood":"calm","duration":30,"activity":"walk","difficulty":"gentle"}`; loading state appears; the adventure renders as a field guide; the Stage 3 note appears when clicking Start; layout checked at desktop and 375 px mobile widths; "can't reach its server" error renders when no backend is present.
- [ ] `npm run dev:client` under Vite on the developer machine
- [ ] Back buttons and "Plan a different one" in a real browser session
- [ ] Mobile layout on a real phone

## Environment (developer machine)
- [x] Ollama installed and running; `gemma3:4b` installed (`ollama list`)
- [x] Stage 1 real generation worked end to end (reported by the developer)

## End to end with real Gemma (Stage 2)
- [ ] Gemma returns structured JSON that passes validation
- [ ] Frontend renders a real Gemma adventure
- [ ] Calm + 30 + Walk + Gentle
- [ ] Energized + 45 + Explore + Moderate
- [ ] Curious + 15 + Observe nature + Gentle
- [ ] The three adventures are meaningfully different (mood visibly changes the missions)
- [ ] Mission durations fit the requested time on real output (how often the retry triggers)
- [ ] Wrong `OLLAMA_MODEL` shows the model-unavailable message
- [ ] Stopping Ollama shows the can't-reach-model message
- [ ] Invalid input rejected by the live API (400)

## Other
- [ ] `docker compose up --build`
- [ ] GitHub Actions workflow