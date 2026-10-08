# Design decisions

- **Gemma 3** – An open-weight model family with small sizes that run on ordinary laptops. `gemma3:4b` is the default balance of quality and size. The project targets Gemma 3 specifically.
- **Ollama** – The simplest way to run local models, with a plain local HTTP API and easy model management (`ollama pull`).
- **React + Vite** – Fast setup and a familiar stack for contributors. Styling is plain CSS to avoid extra build tooling for a small UI.
- **Node / Express** – Small, widely known, and keeps the Ollama connection and prompt out of the browser. The server uses Node's built-in `fetch`, `node:test`, and `process.loadEnvFile`, so there are very few dependencies.
- **Local-first architecture** – The AI runs on the user's machine. This is the project's core idea, not an add-on.
- **No authentication** – There are no accounts or user data to protect, and a login would add complexity without value at this stage.
- **No cloud LLM API** – Avoids keys, billing, and sending prompts to a third party, and keeps the open-weight model a real dependency.
- **Plain text output** – Stage 1 shows Gemma's text as-is. Structured output is deferred.