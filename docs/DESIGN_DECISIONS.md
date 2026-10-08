# Design decisions

## Stage 1 decisions
- **Gemma 3** – Open-weight, with small sizes that run on ordinary laptops. `gemma3:4b` is the default balance of quality and size.
- **Ollama** – The simplest way to run local models, with a plain local HTTP API.
- **React + Vite** – Fast setup and familiar to contributors. Styling is plain CSS to avoid extra build tooling.
- **Node / Express** – Small and widely known; keeps the model connection and prompt out of the browser. Uses Node's built-in `fetch`, `node:test`, and `process.loadEnvFile`.
- **Local-first architecture** – The AI runs on the user's machine. It is the core idea, not an add-on.
- **No authentication / no cloud LLM API** – No accounts or user data to protect, no keys or billing, and the open-weight model stays a real dependency.

## Stage 2 decisions
- **Gemma as "Outdoor Experience Designer", not a chatbot.** The product goal is to get the user off the screen, so there is no conversation to continue.
- **Structured JSON output.** Predictable adventures let the UI render missions consistently and let later stages (Phone Away Mode, offline saving) rely on the shape.
- **Do not trust the model.** Output is parsed, validated, and retried once. Ollama's JSON-schema `format` steers the model; server-side validation is what actually guarantees the shape.
- **The server owns the facts it already knows.** `duration`, `mood`, `activity`, `difficulty`, `phone_free`, and mission `id`s are added by the server rather than echoed by the model. This removes failure modes for a small model, but it means the server does not detect the model "ignoring" the mood in those fields. Whether missions actually reflect the mood is judged by reading the output (see TESTING).
- **Sensory missions.** Hearing, vision, touch, memory, curiosity, and movement missions make the time outside about noticing, not exercise.
- **One question per screen.** The wizard shrinks to a single decision at a time and ends in one button, in keeping with an interface that wants you to leave.
- **Backward compatibility.** Stage 1 activity/difficulty words are still accepted. `mood` is required.
- **A placeholder for Stage 3.** "Start my adventure" shows an honest note instead of faking Phone Away Mode.
- **No safety guarantees.** The prompt asks for safe, low-equipment, no-trespassing missions, but the server only validates structure and timing, not real-world safety.